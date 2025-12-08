-- ============================================
-- 修復管理員帳號（使用現有的 manager@ab360.com）
-- ============================================
-- 
-- 此腳本會：
-- 1. 將 manager@ab360.com 的員工記錄更新為 owner
-- 2. 如果沒有 manager@ab360.com，則使用其他現有用戶
--
-- 執行方式：
-- 在 Supabase Dashboard > SQL Editor 中執行
--
-- ============================================

-- 方法 1：使用 manager@ab360.com（如果存在）
DO $$
DECLARE
  manager_user_id UUID;
  manager_employee_id UUID;
BEGIN
  -- 取得 manager@ab360.com 的用戶 ID
  SELECT id INTO manager_user_id
  FROM auth.users
  WHERE email = 'manager@ab360.com'
  LIMIT 1;
  
  IF manager_user_id IS NOT NULL THEN
    RAISE NOTICE '✅ 找到 manager@ab360.com，用戶 ID: %', manager_user_id;
    
    -- 更新或建立員工記錄為 owner
    INSERT INTO employees (auth_user_id, name, email, role, department)
    VALUES (manager_user_id, '系統管理員', 'manager@ab360.com', 'owner', 'front')
    ON CONFLICT (auth_user_id) 
    DO UPDATE SET 
      name = '系統管理員',
      email = 'manager@ab360.com',
      role = 'owner',
      department = 'front';
    
    SELECT id INTO manager_employee_id
    FROM employees
    WHERE auth_user_id = manager_user_id;
    
    RAISE NOTICE '✅ 員工記錄已更新為 owner';
    RAISE NOTICE '   員工 ID: %', manager_employee_id;
    RAISE NOTICE '';
    RAISE NOTICE '📝 登入資訊：';
    RAISE NOTICE '   Email: manager@ab360.com';
    RAISE NOTICE '   Password: （請在 Supabase Dashboard 中重設）';
    RAISE NOTICE '   Role: owner (擁有者)';
  ELSE
    RAISE NOTICE '⚠️  未找到 manager@ab360.com';
    RAISE NOTICE '請使用下方的方法 2 或方法 3';
  END IF;
END $$;

-- ============================================
-- 方法 2：使用任何現有的 ab360.com 用戶
-- ============================================
-- 如果 manager@ab360.com 不存在，可以使用其他用戶
-- 取消註解下方代碼並替換 YOUR_EMAIL 為實際的 email

/*
DO $$
DECLARE
  user_email TEXT := 'zhang@ab360.com';  -- 替換為您想使用的 email
  user_id UUID;
BEGIN
  SELECT id INTO user_id
  FROM auth.users
  WHERE email = user_email
  LIMIT 1;
  
  IF user_id IS NOT NULL THEN
    INSERT INTO employees (auth_user_id, name, email, role, department)
    VALUES (user_id, '系統管理員', user_email, 'owner', 'front')
    ON CONFLICT (auth_user_id) 
    DO UPDATE SET 
      name = '系統管理員',
      role = 'owner';
    
    RAISE NOTICE '✅ 已將 % 設為 owner', user_email;
  ELSE
    RAISE NOTICE '❌ 未找到用戶: %', user_email;
  END IF;
END $$;
*/

-- ============================================
-- 方法 3：檢查所有現有用戶的員工記錄
-- ============================================
-- 查看哪些用戶已經有員工記錄，哪些沒有

SELECT 
  au.email as auth_email,
  au.id as auth_user_id,
  CASE 
    WHEN e.id IS NOT NULL THEN '✅ 有員工記錄'
    ELSE '❌ 沒有員工記錄'
  END as employee_status,
  e.role as current_role,
  e.name as employee_name
FROM auth.users au
LEFT JOIN employees e ON e.auth_user_id = au.id
WHERE au.email LIKE '%@ab360.com'
ORDER BY au.email;

-- ============================================
-- 驗證修復結果
-- ============================================
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
WHERE e.role IN ('owner', 'manager')
ORDER BY e.role, e.email;

