-- ============================================
-- 使用 Supabase Management API 建立 Auth 使用者
-- ============================================
-- 
-- 注意：此方法需要在 Supabase Dashboard 的 SQL Editor 執行
-- 但 Supabase 不允許直接透過 SQL 建立 Auth 使用者
-- 
-- 替代方案：使用 Supabase Dashboard UI 或 API
-- ============================================

-- 無法直接透過 SQL 建立 Auth 使用者
-- 請使用以下方法之一：

-- 方法 1：使用 Supabase Dashboard UI
-- 1. 前往 Authentication → Users → Add user → Create new user
-- 2. 建立以下 10 個帳號：

/*
1. admin@ab360.com / admin123 (owner)
2. zhang@ab360.com / zhang123 (staff)
3. li@ab360.com / li123 (staff)
4. wang@ab360.com / wang123 (staff)
5. chen@ab360.com / chen123 (staff)
6. lin@ab360.com / lin123 (staff)
7. huang@ab360.com / huang123 (staff)
8. wu@ab360.com / wu123 (staff)
9. zhou@ab360.com / zhou123 (staff)
10. manager@ab360.com / manager123 (manager)
*/

-- 方法 2：使用 Supabase CLI（如果已安裝）
-- supabase auth users create --email admin@ab360.com --password admin123

-- 方法 3：使用 HTTP API（需要 service_role key）
-- 這需要在後端執行，無法在 SQL Editor 中執行

-- ============================================
-- 建立完成後，查詢所有 User ID
-- ============================================

SELECT 
  id,
  email,
  created_at
FROM auth.users
WHERE email LIKE '%@ab360.com'
ORDER BY created_at DESC;

-- 將返回的 ID 用於 create-test-data.sql

