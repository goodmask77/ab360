-- ============================================
-- 建立管理員測試帳號
-- ============================================
-- 
-- 此腳本會建立一個可以直接登入的管理員帳號
-- 用於測試和生成虛擬數據
--
-- 執行方式：
-- 1. 在 Supabase Dashboard > SQL Editor 中執行
-- 2. 或使用 Supabase CLI: supabase db execute -f create-admin-account.sql
--
-- ============================================

-- 設定管理員帳號資訊
DO $$
DECLARE
  admin_email TEXT := 'admin@ab360.test';
  admin_password TEXT := 'Admin123!';
  admin_name TEXT := '系統管理員';
  admin_user_id UUID;
  admin_employee_id UUID;
BEGIN
  -- 1. 在 Supabase Auth 中建立用戶（使用 Supabase 的 auth.users 表）
  -- 注意：Supabase Auth 的用戶建立需要使用 Supabase Admin API 或 Dashboard
  -- 這裡我們先檢查是否已存在，如果不存在則需要手動建立
  
  -- 檢查是否已存在該 email 的用戶
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = admin_email
  LIMIT 1;
  
  -- 如果用戶不存在，提示需要手動建立
  IF admin_user_id IS NULL THEN
    RAISE NOTICE '⚠️  用戶 % 在 auth.users 中不存在', admin_email;
    RAISE NOTICE '請先使用以下方式建立用戶：';
    RAISE NOTICE '1. Supabase Dashboard > Authentication > Users > Add User';
    RAISE NOTICE '2. Email: %', admin_email;
    RAISE NOTICE '3. Password: %', admin_password;
    RAISE NOTICE '4. 或使用 Supabase Admin API';
    RAISE NOTICE '';
    RAISE NOTICE '建立用戶後，請重新執行此腳本的下半部分（建立員工記錄）';
    RETURN;
  END IF;
  
  RAISE NOTICE '✅ 找到用戶 ID: %', admin_user_id;
  
  -- 2. 建立或更新員工記錄
  INSERT INTO employees (auth_user_id, name, email, role, department)
  VALUES (admin_user_id, admin_name, admin_email, 'owner', 'front')
  ON CONFLICT (auth_user_id) 
  DO UPDATE SET 
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = 'owner',
    department = EXCLUDED.department;
  
  -- 取得員工 ID
  SELECT id INTO admin_employee_id
  FROM employees
  WHERE auth_user_id = admin_user_id;
  
  RAISE NOTICE '✅ 員工記錄已建立/更新';
  RAISE NOTICE '   員工 ID: %', admin_employee_id;
  RAISE NOTICE '   姓名: %', admin_name;
  RAISE NOTICE '   角色: owner (擁有者)';
  RAISE NOTICE '';
  RAISE NOTICE '📝 登入資訊：';
  RAISE NOTICE '   Email: %', admin_email;
  RAISE NOTICE '   Password: %', admin_password;
  RAISE NOTICE '';
  RAISE NOTICE '🎉 完成！現在可以使用此帳號登入並訪問測試工具頁面';
  
END $$;

-- ============================================
-- 驗證建立結果
-- ============================================
SELECT 
  e.id as employee_id,
  e.name,
  e.email,
  e.role,
  e.department,
  e.auth_user_id,
  CASE 
    WHEN au.id IS NOT NULL THEN '✅ 已建立'
    ELSE '❌ 未找到'
  END as auth_status
FROM employees e
LEFT JOIN auth.users au ON au.id = e.auth_user_id
WHERE e.email = 'admin@ab360.test';

