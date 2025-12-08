-- ============================================
-- 為 goodmask77@gmail.com 建立員工資料
-- ============================================
-- 
-- 此腳本會為 goodmask77@gmail.com 建立員工資料
-- 如果已存在則更新
--
-- ============================================

-- 為 goodmask77@gmail.com 建立員工資料
INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT 
  id,
  '測試員工',
  'goodmask77@gmail.com',
  'staff',
  'front'
FROM auth.users
WHERE email = 'goodmask77@gmail.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email, department = EXCLUDED.department;

-- 驗證
SELECT id, name, email, role, department, auth_user_id
FROM employees
WHERE email = 'goodmask77@gmail.com';

-- ============================================
-- 完成！
-- ============================================
-- 
-- 現在 goodmask77@gmail.com 應該可以正常登入並看到員工儀表板
--

