# 🚀 快速建立管理員測試帳號

## 方法 1：使用 Node.js 腳本（最簡單，推薦）

### 步驟 1：確認環境變數

確保您的 `.env.local` 文件包含：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**如何取得 Service Role Key：**
1. 前往 Supabase Dashboard
2. 點擊 **Settings** > **API**
3. 複製 `service_role` key（⚠️ 請勿在客戶端使用此 key）

### 步驟 2：執行腳本

```bash
# 安裝依賴（如果還沒安裝）
npm install @supabase/supabase-js dotenv

# 執行腳本
node supabase/create-admin-account-api.js
```

### 步驟 3：登入測試

腳本執行成功後，使用以下資訊登入：

- **Email**: `admin@ab360.test`
- **Password**: `Admin123!`

登入後即可訪問：
- 管理後台：`/admin`
- 測試工具：`/admin/debug-tools`

---

## 方法 2：使用 Supabase Dashboard（手動建立）

### 步驟 1：建立 Auth 用戶

1. 前往 Supabase Dashboard
2. 點擊 **Authentication** > **Users**
3. 點擊 **Add User** > **Create new user**
4. 填寫：
   - Email: `admin@ab360.test`
   - Password: `Admin123!`
   - **Auto Confirm User**: ✅ 勾選（重要！）
5. 點擊 **Create User**
6. 複製 User ID（點擊用戶查看）

### 步驟 2：建立員工記錄

1. 前往 Supabase Dashboard > **SQL Editor**
2. 執行以下 SQL（替換 `YOUR_USER_ID` 為剛才複製的 ID）：

```sql
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES ('YOUR_USER_ID', '系統管理員', 'admin@ab360.test', 'owner', 'front')
ON CONFLICT (auth_user_id) 
DO UPDATE SET 
  name = '系統管理員',
  email = 'admin@ab360.test',
  role = 'owner',
  department = 'front';
```

---

## 方法 3：使用 SQL 腳本（需要先建立 Auth 用戶）

如果您已經在 Supabase Dashboard 中建立了 Auth 用戶：

1. 前往 Supabase Dashboard > **SQL Editor**
2. 執行 `supabase/create-admin-account.sql`

---

## ✅ 驗證帳號

執行以下 SQL 確認帳號已正確建立：

```sql
SELECT 
  e.id as employee_id,
  e.name,
  e.email,
  e.role,
  e.department,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ 已建立'
    ELSE '❌ 未找到'
  END as auth_status
FROM employees e
LEFT JOIN auth.users au ON au.id = e.auth_user_id
WHERE e.email = 'admin@ab360.test';
```

應該看到：
- `role` = `owner`
- `auth_status` = `✅ 已建立`

---

## 🎯 完成後可以做的事

1. ✅ 登入系統（`/login`）
2. ✅ 訪問管理後台（`/admin`）
3. ✅ 訪問測試工具（`/admin/debug-tools`）
4. ✅ 生成完整虛擬數據（50位員工、3個場次等）

---

## ⚠️ 故障排除

### 問題：無法登入

1. 確認 Auth 用戶已建立且 email 已確認
2. 確認 employees 表中有對應記錄
3. 確認 role 欄位為 `owner`

### 問題：看不到測試工具按鈕

1. 確認 employees 表中的 role 為 `owner` 或 `manager`
2. 重新登入系統
3. 檢查瀏覽器控制台是否有錯誤

### 問題：Service Role Key 無效

1. 確認 key 是 `service_role` 而不是 `anon` key
2. 確認 key 沒有過期或被撤銷
3. 在 Supabase Dashboard 中重新生成 key

