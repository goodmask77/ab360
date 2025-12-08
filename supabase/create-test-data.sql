-- ============================================
-- ab360 測試資料建立腳本（10 筆虛擬資料）
-- ============================================
-- 
-- 使用說明：
-- 1. 先在 Supabase Dashboard → Authentication → Users 建立 10 個測試帳號
-- 2. 執行第一個查詢取得所有 User ID
-- 3. 將 User ID 填入下方 SQL
-- 4. 執行完整腳本建立所有測試資料
--
-- ============================================

-- ============================================
-- 步驟 1: 取得所有 Auth User ID
-- ============================================
-- 先執行這個查詢，取得所有使用者的 ID
-- SELECT id, email FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- ============================================
-- 步驟 2: 建立員工資料（替換 YOUR_USER_ID_1 等為實際的 UUID）
-- ============================================

-- 管理員（1 個）
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_USER_ID_1', '系統管理員', 'admin@ab360.com', 'owner', 'management')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

-- 員工（9 個）
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_USER_ID_2', '張三', 'zhang@ab360.com', 'staff', 'front'),
  ('YOUR_USER_ID_3', '李四', 'li@ab360.com', 'staff', 'back'),
  ('YOUR_USER_ID_4', '王五', 'wang@ab360.com', 'staff', 'front'),
  ('YOUR_USER_ID_5', '陳六', 'chen@ab360.com', 'staff', 'back'),
  ('YOUR_USER_ID_6', '林七', 'lin@ab360.com', 'staff', 'front'),
  ('YOUR_USER_ID_7', '黃八', 'huang@ab360.com', 'staff', 'back'),
  ('YOUR_USER_ID_8', '吳九', 'wu@ab360.com', 'staff', 'front'),
  ('YOUR_USER_ID_9', '周十', 'zhou@ab360.com', 'staff', 'back'),
  ('YOUR_USER_ID_10', '主管一', 'manager@ab360.com', 'manager', 'management')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role, email = EXCLUDED.email;

-- ============================================
-- 步驟 3: 建立評鑑場次
-- ============================================

-- 建立進行中的場次
INSERT INTO evaluation_sessions (name, start_at, end_at, status)
VALUES 
  ('2025/04 月度 360', '2025-04-01', '2025-04-30', 'open'),
  ('2025/03 月度 360', '2025-03-01', '2025-03-31', 'closed'),
  ('2025/05 月度 360', '2025-05-01', '2025-05-31', 'draft')
ON CONFLICT DO NOTHING
RETURNING id, name, status;

-- ============================================
-- 步驟 4: 建立評鑑記錄
-- ============================================
-- 注意：需要先取得 employees 和 evaluation_sessions 的 ID

-- 取得 ID（執行後記下結果）
-- SELECT id, name FROM employees WHERE role = 'staff';
-- SELECT id, name FROM evaluation_sessions WHERE status = 'open';

-- 假設場次 ID 是 SESSION_ID，員工 ID 是 EMP_1 到 EMP_9

-- 自評記錄（每個員工對自己）
-- 替換 SESSION_ID 和 EMP_ID 為實際值
/*
INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
SELECT 
  'SESSION_ID',
  id,
  id,
  'self',
  false
FROM employees
WHERE role = 'staff'
ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
*/

-- 同儕評記錄（員工互相評分，建立配對）
-- 替換 SESSION_ID 和實際的員工 ID
/*
INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
VALUES 
  -- 張三評其他人
  ('SESSION_ID', 'EMP_2', 'EMP_3', 'peer', false),
  ('SESSION_ID', 'EMP_2', 'EMP_4', 'peer', false),
  -- 李四評其他人
  ('SESSION_ID', 'EMP_3', 'EMP_2', 'peer', false),
  ('SESSION_ID', 'EMP_3', 'EMP_4', 'peer', false),
  -- 王五評其他人
  ('SESSION_ID', 'EMP_4', 'EMP_2', 'peer', false),
  ('SESSION_ID', 'EMP_4', 'EMP_3', 'peer', false)
ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
*/

-- ============================================
-- 完整自動化版本（使用變數）
-- ============================================
-- 以下版本會自動取得 ID 並建立記錄

DO $$
DECLARE
  session_id_var UUID;
  emp_ids UUID[];
  emp_id UUID;
  target_id UUID;
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

  -- 建立同儕評記錄（每個員工評其他 2-3 個員工）
  FOREACH emp_id IN ARRAY emp_ids
  LOOP
    -- 每個員工評其他 3 個員工
    FOR i IN 1..3 LOOP
      -- 選擇不同的目標（不是自己）
      SELECT id INTO target_id
      FROM employees
      WHERE role = 'staff' 
        AND id != emp_id
        AND id NOT IN (
          SELECT target_id 
          FROM evaluation_records 
          WHERE session_id = session_id_var 
            AND evaluator_id = emp_id
        )
      ORDER BY RANDOM()
      LIMIT 1;

      IF target_id IS NOT NULL THEN
        INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
        VALUES (session_id_var, emp_id, target_id, 'peer', false)
        ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
      END IF;
    END LOOP;
  END LOOP;

  RAISE NOTICE '測試資料建立完成！場次 ID: %', session_id_var;
END $$;

-- ============================================
-- 驗證資料
-- ============================================

-- 檢查員工數量
SELECT COUNT(*) as employee_count, role FROM employees GROUP BY role;

-- 檢查場次
SELECT id, name, status FROM evaluation_sessions ORDER BY created_at DESC;

-- 檢查評鑑記錄數量
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

