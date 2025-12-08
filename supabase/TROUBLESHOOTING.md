# 🔧 問題排查指南

## 問題：Create new user 按鈕無效

### 可能原因和解決方案

#### 1. 檢查瀏覽器 Console
- 按 `F12` 開啟開發者工具
- 查看 Console 標籤是否有錯誤訊息
- 如果有錯誤，請記錄錯誤內容

#### 2. 檢查網路連線
- 確認 Supabase Dashboard 可以正常載入
- 嘗試重新整理頁面（Ctrl+R 或 Cmd+R）

#### 3. 檢查必填欄位
建立使用者時，確保：
- ✅ Email 格式正確（例如：`admin@example.com`）
- ✅ Password 符合要求（至少 6 個字元）
- ✅ **Auto Confirm User** 已勾選（重要！）

#### 4. 嘗試使用 "Send invitation"
- 點擊 "Add user" → "Send invitation"
- 輸入 Email
- 系統會發送邀請郵件
- 使用者點擊郵件中的連結即可建立帳號

#### 5. 使用 Supabase CLI（進階）

如果 UI 無法使用，可以安裝 Supabase CLI：

```bash
# 安裝 Supabase CLI
npm install -g supabase

# 登入
supabase login

# 連結專案
supabase link --project-ref YOUR_PROJECT_REF

# 建立使用者
supabase auth users create --email admin@example.com --password admin123
```

#### 6. 檢查 Supabase 專案狀態
- 前往 Supabase Dashboard → Settings → General
- 確認專案狀態正常
- 檢查是否有配額限制

---

## 替代方案：使用現有 Auth 使用者

如果你已經有其他方式建立的 Auth 使用者：

1. 前往 **Authentication** → **Users**
2. 找到現有使用者
3. 點擊使用者，複製 **User ID**（UUID）
4. 在 SQL Editor 執行：

```sql
-- 建立員工資料（替換 YOUR_USER_ID）
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_USER_ID', '系統管理員', 'admin@example.com', 'owner', 'management')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role;
```

---

## 驗證使用者是否建立成功

### 檢查 Auth 使用者
```sql
SELECT id, email, created_at, last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;
```

### 檢查員工資料
```sql
SELECT id, name, email, role, auth_user_id
FROM employees
ORDER BY role, name;
```

---

## 常見錯誤訊息

### "User already exists"
- **原因**：該 Email 已經存在
- **解決**：使用不同的 Email，或使用現有使用者

### "Invalid email format"
- **原因**：Email 格式不正確
- **解決**：使用正確的 Email 格式（例如：`user@example.com`）

### "Password too short"
- **原因**：密碼長度不足
- **解決**：使用至少 6 個字元的密碼

### "Network error" 或 "Failed to create user"
- **原因**：網路問題或 Supabase 服務問題
- **解決**：
  1. 檢查網路連線
  2. 重新整理頁面
  3. 稍後再試
  4. 檢查 Supabase Status Page

---

## 快速測試：使用現有 Email

如果你有現有的 Supabase Auth 使用者（例如：你的管理員帳號），可以直接使用：

1. 前往 **Authentication** → **Users**
2. 找到你的使用者
3. 複製 **User ID**
4. 在 SQL Editor 執行：

```sql
-- 建立管理員員工資料
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_EXISTING_USER_ID', '系統管理員', 'your-email@example.com', 'owner', 'management')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role;
```

然後就可以用這個 Email 和密碼登入系統了！

---

## 需要更多幫助？

如果以上方法都無法解決，請提供：
1. 瀏覽器 Console 的錯誤訊息
2. Supabase Dashboard 顯示的錯誤（如果有）
3. 你嘗試的具體步驟

