# ab360 系統設定指南

## 📋 初始設定步驟

### 1. 建立 Supabase Auth 測試帳號

1. 前往 Supabase Dashboard → Authentication → Users
2. 點擊 "Add user" → "Create new user"
3. 建立以下測試帳號：

#### 管理員帳號
- Email: `admin@example.com`
- Password: `admin123` (或自訂)
- 記下 User ID（會在建立後顯示）

#### 員工帳號（至少建立 2-3 個）
- Email: `zhang@example.com`
- Password: `zhang123`
- 記下 User ID

### 2. 在 Supabase 建立員工資料

前往 SQL Editor，執行以下 SQL（替換 `YOUR_AUTH_USER_ID` 為實際的 User ID）：

```sql
-- 建立管理員
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_ADMIN_USER_ID', '管理員', 'admin@example.com', 'owner', 'management')
ON CONFLICT (auth_user_id) DO NOTHING;

-- 建立員工
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_ZHANG_USER_ID', '張三', 'zhang@example.com', 'staff', 'front'),
  ('YOUR_LI_USER_ID', '李四', 'li@example.com', 'staff', 'back')
ON CONFLICT (auth_user_id) DO NOTHING;
```

### 3. 建立測試評鑑場次

```sql
-- 建立一個進行中的場次
INSERT INTO evaluation_sessions (name, start_at, end_at, status)
VALUES 
  ('2025/04 月度 360', '2025-04-01', '2025-04-30', 'open')
RETURNING id;
```

記下返回的 `id`（例如：`abc123-def456-...`）

### 4. 建立評鑑記錄

取得員工的 ID：

```sql
SELECT id, name, email FROM employees;
```

然後建立評鑑記錄（替換 `SESSION_ID` 和 `EMPLOYEE_ID`）：

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
WHERE role = 'staff';

-- 同儕評記錄（員工互相評分）
-- 假設有兩個員工：EMP_ID_1 和 EMP_ID_2
INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
VALUES 
  ('SESSION_ID', 'EMP_ID_1', 'EMP_ID_2', 'peer', false),
  ('SESSION_ID', 'EMP_ID_2', 'EMP_ID_1', 'peer', false);
```

## 🎯 功能測試

### 登入測試
1. 前往 `/login`
2. 使用建立的帳號登入
3. 應該會自動導向到對應的儀表板

### 管理員功能
1. 使用管理員帳號登入
2. 前往 `/admin/dashboard`
3. 應該可以看到「建立新場次」按鈕
4. 建立新場次後，點擊「進入管理」查看評鑑記錄

### 員工功能
1. 使用員工帳號登入
2. 前往 `/dashboard`
3. 應該可以看到自評任務和同儕評任務
4. 點擊「開始填寫」或「開始評價」進入評鑑表單
5. 填寫評分（1-5分）和文字回饋
6. 提交後返回儀表板，狀態應變為「已完成」

## 🔐 權限說明

- **owner / manager**: 可訪問管理後台，建立和管理評鑑場次
- **staff**: 只能訪問員工儀表板，填寫評鑑表單

## 📝 注意事項

1. 確保 Supabase 的 Row Level Security (RLS) 已正確設定
2. 如果無法查詢資料，可能需要調整 Supabase 的權限設定
3. 建議在 Supabase Dashboard → Authentication → Policies 中設定適當的 RLS 政策

## 🐛 常見問題

### 登入後無法看到資料
- 檢查 `employees` 表中是否有對應的記錄
- 確認 `auth_user_id` 是否正確對應到 Supabase Auth 的 user.id

### 無法建立場次
- 確認登入的帳號 role 為 `manager` 或 `owner`
- 檢查 Supabase 的 RLS 政策是否允許插入

### 評鑑表單無法提交
- 確認所有維度都已評分（1-5分）
- 檢查 Supabase 的 RLS 政策是否允許寫入 `evaluation_scores` 和 `evaluation_comments`

