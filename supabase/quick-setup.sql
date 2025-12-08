-- ============================================
-- ab360 快速設定腳本（一鍵建立所有測試資料）
-- ============================================
-- 
-- 使用說明：
-- 1. 先在 Supabase Dashboard → Authentication → Users 建立以下 10 個帳號：
--    - admin@ab360.com / admin123 (owner)
--    - zhang@ab360.com / zhang123 (staff)
--    - li@ab360.com / li123 (staff)
--    - wang@ab360.com / wang123 (staff)
--    - chen@ab360.com / chen123 (staff)
--    - lin@ab360.com / lin123 (staff)
--    - huang@ab360.com / huang123 (staff)
--    - wu@ab360.com / wu123 (staff)
--    - zhou@ab360.com / zhou123 (staff)
--    - manager@ab360.com / manager123 (manager)
--
-- 2. 執行此腳本，會自動建立所有測試資料
--
-- ============================================

-- ============================================
-- 步驟 1: 建立員工資料（自動取得 User ID）
-- ============================================

-- 管理員
INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT 
  id,
  '系統管理員',
  'admin@ab360.com',
  'owner',
  'management'
FROM auth.users
WHERE email = 'admin@ab360.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

-- 員工
INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT id, '張三', 'zhang@ab360.com', 'staff', 'front'
FROM auth.users WHERE email = 'zhang@ab360.com'
ON CONFLICT (auth_user_id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT id, '李四', 'li@ab360.com', 'staff', 'back'
FROM auth.users WHERE email = 'li@ab360.com'
ON CONFLICT (auth_user_id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT id, '王五', 'wang@ab360.com', 'staff', 'front'
FROM auth.users WHERE email = 'wang@ab360.com'
ON CONFLICT (auth_user_id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT id, '陳六', 'chen@ab360.com', 'staff', 'back'
FROM auth.users WHERE email = 'chen@ab360.com'
ON CONFLICT (auth_user_id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT id, '林七', 'lin@ab360.com', 'staff', 'front'
FROM auth.users WHERE email = 'lin@ab360.com'
ON CONFLICT (auth_user_id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT id, '黃八', 'huang@ab360.com', 'staff', 'back'
FROM auth.users WHERE email = 'huang@ab360.com'
ON CONFLICT (auth_user_id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT id, '吳九', 'wu@ab360.com', 'staff', 'front'
FROM auth.users WHERE email = 'wu@ab360.com'
ON CONFLICT (auth_user_id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT id, '周十', 'zhou@ab360.com', 'staff', 'back'
FROM auth.users WHERE email = 'zhou@ab360.com'
ON CONFLICT (auth_user_id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

-- 主管
INSERT INTO employees (auth_user_id, name, email, role, department)
SELECT id, '主管一', 'manager@ab360.com', 'manager', 'management'
FROM auth.users WHERE email = 'manager@ab360.com'
ON CONFLICT (auth_user_id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

-- ============================================
-- 步驟 2: 建立評鑑場次
-- ============================================

INSERT INTO evaluation_sessions (name, start_at, end_at, status)
VALUES 
  ('2025/04 月度 360', '2025-04-01', '2025-04-30', 'open'),
  ('2025/03 月度 360', '2025-03-01', '2025-03-31', 'closed'),
  ('2025/05 月度 360', '2025-05-01', '2025-05-31', 'draft')
ON CONFLICT DO NOTHING;

-- ============================================
-- 步驟 3: 建立評鑑記錄（自動化）
-- ============================================

DO $$
DECLARE
  session_id_var UUID;
  emp_ids UUID[];
  emp_id UUID;
  target_id UUID;
  i INTEGER;
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

  -- 取得所有員工 ID
  SELECT ARRAY_AGG(id) INTO emp_ids
  FROM employees
  WHERE role = 'staff';

  -- 為每個員工建立自評記錄
  FOREACH emp_id IN ARRAY emp_ids
  LOOP
    INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
    VALUES (session_id_var, emp_id, emp_id, 'self', false)
    ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
  END LOOP;

  -- 建立同儕評記錄（每個員工評其他 3 個員工）
  FOREACH emp_id IN ARRAY emp_ids
  LOOP
    i := 0;
    -- 每個員工評其他 3 個員工
    FOR target_id IN 
      SELECT id 
      FROM employees
      WHERE role = 'staff' AND id != emp_id
      ORDER BY RANDOM()
      LIMIT 3
    LOOP
      INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
      VALUES (session_id_var, emp_id, target_id, 'peer', false)
      ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
      i := i + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE '✅ 測試資料建立完成！場次 ID: %', session_id_var;
  RAISE NOTICE '✅ 已建立 % 個員工的自評記錄', array_length(emp_ids, 1);
END $$;

-- ============================================
-- 驗證資料
-- ============================================

SELECT '=== 員工資料 ===' as info;
SELECT COUNT(*) as total, role, COUNT(*) as count 
FROM employees 
GROUP BY role
ORDER BY role;

SELECT '=== 場次資料 ===' as info;
SELECT id, name, status, start_at, end_at 
FROM evaluation_sessions 
ORDER BY created_at DESC;

SELECT '=== 評鑑記錄 ===' as info;
SELECT 
  es.name as session_name,
  COUNT(er.id) as total_records,
  COUNT(CASE WHEN er.type = 'self' THEN 1 END) as self_count,
  COUNT(CASE WHEN er.type = 'peer' THEN 1 END) as peer_count
FROM evaluation_sessions es
LEFT JOIN evaluation_records er ON es.id = er.session_id
GROUP BY es.id, es.name
ORDER BY es.created_at DESC;

-- ============================================
-- 完成！
-- ============================================
-- 
-- 現在可以使用以下帳號登入測試：
-- - admin@ab360.com / admin123 (管理後台)
-- - zhang@ab360.com / zhang123 (員工儀表板)
-- - manager@ab360.com / manager123 (管理後台)
--

