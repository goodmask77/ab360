# 📝 RLS 政策和測試資料執行步驟

## ⚠️ 重要：請按照順序執行

### 步驟 1：執行 RLS 政策（必須先執行）

1. 前往 **Supabase Dashboard** → **SQL Editor**
2. 點擊 **New query**
3. 開啟專案中的 `supabase/rls-policies.sql` 檔案
4. **複製全部內容**（259 行）
5. 貼上到 SQL Editor
6. 點擊 **Run** 執行
7. 應該會看到 "Success. No rows returned" 或類似的成功訊息

**驗證**：執行以下查詢確認 RLS 已啟用：
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('employees', 'evaluation_sessions', 'evaluation_records');
```
所有表的 `rowsecurity` 應該都是 `true`。

---

### 步驟 2：建立測試帳號

1. 前往 **Authentication** → **Users**
2. 點擊 **Add user** → **Create new user**

#### 建立管理員帳號
- **Email**: `admin@example.com`
- **Password**: `admin123`（或自訂強密碼）
- 點擊 **Create user**
- **重要**：建立後，點擊該用戶，**複製 User ID**（UUID 格式，例如：`a1b2c3d4-e5f6-7890-abcd-ef1234567890`）

#### 建立員工帳號 1
- **Email**: `zhang@example.com`
- **Password**: `zhang123`
- 建立後，**複製 User ID**

#### 建立員工帳號 2
- **Email**: `li@example.com`
- **Password**: `li123`
- 建立後，**複製 User ID**

**建議**：將這些 User ID 記錄在記事本中，後續會用到。

---

### 步驟 3：建立員工資料

1. 前往 **SQL Editor** → **New query**
2. 執行以下 SQL（**替換 YOUR_ADMIN_USER_ID 等為實際的 User ID**）：

```sql
-- 建立管理員
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_ADMIN_USER_ID', '系統管理員', 'admin@example.com', 'owner', 'management')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role;

-- 建立員工 1
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_ZHANG_USER_ID', '張三', 'zhang@example.com', 'staff', 'front')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role;

-- 建立員工 2
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_LI_USER_ID', '李四', 'li@example.com', 'staff', 'back')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role;
```

3. 執行後，驗證資料：
```sql
SELECT id, name, email, role, auth_user_id FROM employees;
```

**記下每個員工的 `id`**（不是 `auth_user_id`，是 `id`），後續建立評鑑記錄時會用到。

---

### 步驟 4：建立測試場次

1. 在 **SQL Editor** 執行：
```sql
-- 建立進行中的場次
INSERT INTO evaluation_sessions (name, start_at, end_at, status)
VALUES 
  ('2025/04 月度 360', '2025-04-01', '2025-04-30', 'open')
RETURNING id, name;
```

2. **記下返回的 `id`**（UUID），這是 `SESSION_ID`。

---

### 步驟 5：建立評鑑記錄

1. 先取得員工 ID：
```sql
SELECT id, name, email FROM employees WHERE role = 'staff';
```

2. 記下員工的 `id`（例如：`EMP_ID_1`、`EMP_ID_2`）

3. 建立自評記錄（**替換 SESSION_ID 為步驟 4 取得的 ID**）：
```sql
-- 自評記錄（每個員工對自己）
INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
SELECT 
  'SESSION_ID',  -- 替換為實際的 session_id
  id,            -- 評分人（自己）
  id,            -- 被評人（自己）
  'self',
  false
FROM employees
WHERE role = 'staff'
ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
```

4. 建立同儕評記錄（**替換 SESSION_ID、EMP_ID_1、EMP_ID_2**）：
```sql
-- 同儕評記錄（員工互相評分）
INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
VALUES 
  ('SESSION_ID', 'EMP_ID_1', 'EMP_ID_2', 'peer', false),
  ('SESSION_ID', 'EMP_ID_2', 'EMP_ID_1', 'peer', false)
ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
```

---

### 步驟 6：驗證設定

執行 `supabase/verify-setup.sql` 來檢查所有設定是否正確。

或者執行以下快速檢查：
```sql
-- 檢查員工數量
SELECT COUNT(*) as employee_count FROM employees;

-- 檢查場次數量
SELECT COUNT(*) as session_count FROM evaluation_sessions WHERE status = 'open';

-- 檢查評鑑記錄數量
SELECT COUNT(*) as record_count FROM evaluation_records;
```

---

## ✅ 完成檢查清單

- [ ] RLS 政策已執行（所有表都啟用 RLS）
- [ ] 已建立至少 1 個管理員帳號
- [ ] 已建立至少 2 個員工帳號
- [ ] 已在 `employees` 表建立對應記錄
- [ ] 已建立至少 1 個「進行中」的場次
- [ ] 已為場次建立自評記錄
- [ ] 已為場次建立同儕評記錄
- [ ] 驗證查詢都返回預期結果

---

## 🎯 測試系統

完成以上步驟後：

1. 前往你的 Vercel 部署網址（或 `http://localhost:3000`）
2. 使用 `admin@example.com` / `admin123` 登入
3. 應該會看到管理後台
4. 登出後，使用 `zhang@example.com` / `zhang123` 登入
5. 應該會看到員工儀表板，有自評和同儕評任務

---

## 🐛 如果遇到錯誤

### 錯誤：permission denied
- **原因**：RLS 政策未正確設定
- **解決**：重新執行 `rls-policies.sql`

### 錯誤：duplicate key value
- **原因**：資料已存在
- **解決**：使用 `ON CONFLICT DO NOTHING` 或 `ON CONFLICT DO UPDATE`

### 錯誤：foreign key constraint
- **原因**：引用的 ID 不存在
- **解決**：確認 `session_id` 和 `employee_id` 是否正確

---

## 📞 需要幫助？

如果執行過程中遇到問題，請提供：
1. 錯誤訊息
2. 執行到哪個步驟
3. SQL Editor 的錯誤日誌

