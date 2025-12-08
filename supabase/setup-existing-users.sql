-- ============================================
-- 為現有 Auth 使用者建立員工資料
-- ============================================
-- 
-- 此腳本會自動為現有的 Auth 使用者建立對應的員工資料
-- 不需要手動輸入 User ID
--
-- ============================================

-- ============================================
-- 步驟 1: 為現有使用者建立員工資料
-- ============================================

-- 為 admin@example.com 建立管理員資料
INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT 
  id,
  '系統管理員',
  'admin@example.com',
  'owner',
  'management'
FROM auth.users
WHERE email = 'admin@example.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

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
SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

-- ============================================
-- 步驟 2: 建立測試場次
-- ============================================

INSERT INTO evaluation_sessions (name, start_at, end_at, status)
VALUES 
  ('2025/04 月度 360', '2025-04-01', '2025-04-30', 'open'),
  ('2025/03 月度 360', '2025-03-01', '2025-03-31', 'closed')
ON CONFLICT DO NOTHING;

-- ============================================
-- 步驟 3: 建立評鑑記錄
-- ============================================

DO $$
DECLARE
  session_id_var UUID;
  admin_emp_id UUID;
  staff_emp_id UUID;
BEGIN
  -- 取得進行中的場次 ID
  SELECT id INTO session_id_var 
  FROM evaluation_sessions 
  WHERE status = 'open' 
  ORDER BY created_at DESC 
  LIMIT 1;

  -- 如果沒有場次，建立一個
  IF session_id_var IS NULL THEN
    INSERT INTO evaluation_sessions (name, start_at, end_at, status)
    VALUES ('2025/04 月度 360', '2025-04-01', '2025-04-30', 'open')
    RETURNING id INTO session_id_var;
  END IF;

  -- 取得員工 ID
  SELECT id INTO admin_emp_id FROM employees WHERE email = 'admin@example.com';
  SELECT id INTO staff_emp_id FROM employees WHERE email = 'goodmask77@gmail.com';

  -- 為員工建立自評記錄
  IF staff_emp_id IS NOT NULL THEN
    INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
    VALUES (session_id_var, staff_emp_id, staff_emp_id, 'self', false)
    ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
    
    RAISE NOTICE '✅ 已為員工建立自評記錄';
  END IF;

  RAISE NOTICE '✅ 測試資料建立完成！場次 ID: %', session_id_var;
END $$;

-- ============================================
-- 驗證資料
-- ============================================

SELECT '=== 員工資料 ===' as info;
SELECT id, name, email, role, department, auth_user_id
FROM employees
ORDER BY role, name;

SELECT '=== 場次資料 ===' as info;
SELECT id, name, status, start_at, end_at 
FROM evaluation_sessions 
ORDER BY created_at DESC;

SELECT '=== 評鑑記錄 ===' as info;
SELECT 
  e.name as evaluator_name,
  t.name as target_name,
  er.type,
  es.name as session_name
FROM evaluation_records er
JOIN employees e ON er.evaluator_id = e.id
JOIN employees t ON er.target_id = t.id
JOIN evaluation_sessions es ON er.session_id = es.id
ORDER BY es.created_at DESC, er.type;

-- ============================================
-- 完成！
-- ============================================
-- 
-- 現在可以使用以下帳號登入測試：
-- - admin@example.com (管理後台)
-- - goodmask77@gmail.com (員工儀表板)
--
-- 如果需要建立更多測試帳號，請參考 quick-setup.sql
--

