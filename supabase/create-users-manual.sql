-- ============================================
-- 手動建立 Supabase Auth 使用者（使用 SQL）
-- ============================================
-- 
-- 如果透過 UI 建立使用者失敗，可以使用此方法
-- 注意：此方法需要 Supabase 的 auth.users 表有寫入權限
-- 通常需要透過 Supabase Dashboard 的 SQL Editor 執行
--
-- ============================================

-- 方法 1：使用 Supabase 的 auth.users 表（需要管理員權限）
-- 注意：這通常需要 service_role key，不建議在客戶端使用

-- 方法 2：使用 Supabase Management API（推薦）
-- 但這需要在後端執行，無法直接在 SQL Editor 執行

-- ============================================
-- 替代方案：先建立員工資料，稍後再建立 Auth 帳號
-- ============================================

-- 如果你已經有 Auth User ID，可以直接建立員工資料：
-- INSERT INTO employees (auth_user_id, name, email, role, department)
-- VALUES 
--   ('YOUR_AUTH_USER_ID', '測試管理員', 'admin@test.com', 'owner', 'management');

-- ============================================
-- 檢查現有的 Auth 使用者
-- ============================================

-- 查看所有 Auth 使用者（需要適當權限）
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- 建議的建立流程
-- ============================================
-- 
-- 1. 在 Supabase Dashboard → Authentication → Users
-- 2. 點擊 "Add user" → "Create new user"
-- 3. 填寫：
--    - Email: admin@example.com
--    - Password: admin123
--    - Auto Confirm User: ✅ 勾選（重要！）
-- 4. 點擊 "Create user"
-- 5. 建立後，點擊該用戶查看 User ID
-- 6. 複製 User ID，然後在 SQL Editor 執行下方 SQL
--
-- ============================================

-- 建立員工資料範例（替換 YOUR_USER_ID）
/*
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_USER_ID', '系統管理員', 'admin@example.com', 'owner', 'management')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role;
*/

-- ============================================
-- 如果 Create new user 按鈕無效的解決方案
-- ============================================
-- 
-- 1. 檢查瀏覽器 Console 是否有錯誤
-- 2. 嘗試重新整理頁面
-- 3. 檢查 Supabase 專案是否正常運作
-- 4. 嘗試使用 "Send invitation" 功能
-- 5. 或者使用 Supabase CLI 建立使用者
--
-- ============================================

