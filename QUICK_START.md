# 🚀 ab360 快速開始指南

## 第一步：設定 Supabase RLS 政策

1. 前往 Supabase Dashboard → SQL Editor
2. 開啟 `supabase/rls-policies.sql`
3. 複製全部內容並執行
4. 這會啟用所有資料表的 RLS 並設定安全政策

## 第二步：建立測試帳號

### 在 Supabase Authentication 建立帳號

1. 前往 **Authentication** → **Users** → **Add user** → **Create new user**

2. 建立以下帳號：

#### 管理員帳號
- **Email**: `admin@example.com`
- **Password**: `admin123`（或自訂）
- 建立後，**複製 User ID**（點擊用戶可以看到 UUID）

#### 員工帳號（至少建立 2 個）
- **Email**: `zhang@example.com`
- **Password**: `zhang123`
- 建立後，**複製 User ID**

- **Email**: `li@example.com`
- **Password**: `li123`
- 建立後，**複製 User ID**

## 第三步：建立員工資料和測試資料

1. 前往 **SQL Editor**
2. 開啟 `supabase/setup-complete.sql`
3. 將所有 `YOUR_ADMIN_USER_ID`、`YOUR_EMPLOYEE1_USER_ID` 等替換為實際的 User ID
4. 執行 SQL 腳本

### 或者手動執行：

```sql
-- 1. 建立員工資料（替換 YOUR_USER_ID）
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_ADMIN_USER_ID', '系統管理員', 'admin@example.com', 'owner', 'management'),
  ('YOUR_ZHANG_USER_ID', '張三', 'zhang@example.com', 'staff', 'front'),
  ('YOUR_LI_USER_ID', '李四', 'li@example.com', 'staff', 'back');

-- 2. 建立測試場次
INSERT INTO evaluation_sessions (name, start_at, end_at, status)
VALUES 
  ('2025/04 月度 360', '2025-04-01', '2025-04-30', 'open')
RETURNING id;  -- 記下這個 ID

-- 3. 取得員工 ID
SELECT id, name FROM employees;

-- 4. 建立評鑑記錄（替換 SESSION_ID 和 EMPLOYEE_ID）
-- 自評
INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
SELECT 'SESSION_ID', id, id, 'self', false FROM employees WHERE role = 'staff';

-- 同儕評（假設有兩個員工：EMP_ID_1 和 EMP_ID_2）
INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
VALUES 
  ('SESSION_ID', 'EMP_ID_1', 'EMP_ID_2', 'peer', false),
  ('SESSION_ID', 'EMP_ID_2', 'EMP_ID_1', 'peer', false);
```

## 第四步：測試系統

### 1. 測試登入
- 前往 `https://your-domain.vercel.app/login`
- 使用建立的帳號登入
- 應該會自動導向到對應的儀表板

### 2. 測試管理員功能
- 使用管理員帳號登入
- 前往 `/admin/dashboard`
- 點擊「建立新場次」建立新場次
- 點擊「進入管理」查看場次詳情

### 3. 測試員工功能
- 使用員工帳號登入
- 前往 `/dashboard`
- 應該可以看到自評和同儕評任務
- 點擊「開始填寫」或「開始評價」
- 填寫評分（1-5分）和文字回饋
- 提交後檢查狀態是否變為「已完成」

## 📋 檢查清單

- [ ] 已執行 RLS 政策 SQL
- [ ] 已建立至少 1 個管理員帳號
- [ ] 已建立至少 2 個員工帳號
- [ ] 已在 `employees` 表建立對應記錄
- [ ] 已建立至少 1 個「進行中」的評鑑場次
- [ ] 已為場次建立自評和同儕評記錄
- [ ] 已測試登入功能
- [ ] 已測試管理後台功能
- [ ] 已測試評鑑表單填寫功能

## 🐛 問題排查

### 無法登入
- 確認 Supabase Auth 中帳號已建立
- 確認 `employees` 表中有對應的 `auth_user_id` 記錄

### 登入後看不到資料
- 檢查 RLS 政策是否已執行
- 確認評鑑場次狀態為 `open`
- 確認已建立評鑑記錄

### 無法建立場次
- 確認登入帳號的 `role` 為 `manager` 或 `owner`
- 檢查 RLS 政策中的 `evaluation_sessions` INSERT 政策

### 無法提交評鑑
- 確認所有維度都已評分（1-5分）
- 檢查 RLS 政策中的 `evaluation_scores` 和 `evaluation_comments` 政策

## 📞 需要幫助？

如果遇到問題，請檢查：
1. Supabase Dashboard → Logs 查看錯誤訊息
2. 瀏覽器 Console 查看前端錯誤
3. 確認所有環境變數已正確設定

