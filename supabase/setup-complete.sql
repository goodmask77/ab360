-- ============================================
-- ab360 完整設定腳本（包含測試資料）
-- ============================================
-- 
-- 使用說明：
-- 1. 先在 Supabase Dashboard → Authentication 手動建立測試帳號
-- 2. 取得每個帳號的 User ID（在 Authentication → Users 中查看）
-- 3. 將下方 SQL 中的 'YOUR_USER_ID' 替換為實際的 User ID
-- 4. 執行此腳本
--
-- ============================================

-- ============================================
-- 步驟 1: 建立員工資料
-- ============================================
-- 請替換 'YOUR_ADMIN_USER_ID' 等為實際的 Supabase Auth User ID

-- 管理員（owner）
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_ADMIN_USER_ID', '系統管理員', 'admin@example.com', 'owner', 'management')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role;

-- 員工 1
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_EMPLOYEE1_USER_ID', '張三', 'zhang@example.com', 'staff', 'front')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role;

-- 員工 2
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_EMPLOYEE2_USER_ID', '李四', 'li@example.com', 'staff', 'back')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role;

-- 員工 3（可選）
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_EMPLOYEE3_USER_ID', '王五', 'wang@example.com', 'staff', 'front')
ON CONFLICT (auth_user_id) DO UPDATE
SET name = EXCLUDED.name, role = EXCLUDED.role;

-- ============================================
-- 步驟 2: 建立測試評鑑場次
-- ============================================

-- 建立一個進行中的場次
INSERT INTO evaluation_sessions (name, start_at, end_at, status)
VALUES 
  ('2025/04 月度 360', '2025-04-01', '2025-04-30', 'open')
ON CONFLICT DO NOTHING
RETURNING id, name;

-- 建立一個已結束的場次（用於測試）
INSERT INTO evaluation_sessions (name, start_at, end_at, status)
VALUES 
  ('2025/03 月度 360', '2025-03-01', '2025-03-31', 'closed')
ON CONFLICT DO NOTHING;

-- ============================================
-- 步驟 3: 建立評鑑記錄
-- ============================================
-- 注意：需要先取得 employees 和 evaluation_sessions 的 ID
-- 執行以下查詢來取得 ID：

-- 取得員工 ID
-- SELECT id, name, email FROM employees;

-- 取得場次 ID
-- SELECT id, name, status FROM evaluation_sessions WHERE status = 'open';

-- 然後使用以下範例建立評鑑記錄（替換實際的 ID）：

-- 範例：為 2025/04 月度 360 場次建立自評和同儕評
-- 假設：
-- - SESSION_ID = '場次的 UUID'
-- - EMP_ID_1 = '張三的 UUID'
-- - EMP_ID_2 = '李四的 UUID'
-- - EMP_ID_3 = '王五的 UUID'（如果有）

/*
-- 自評記錄（每個員工對自己）
INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
SELECT 
  'SESSION_ID',  -- 替換為實際的 session_id
  id,            -- 評分人（自己）
  id,            -- 被評人（自己）
  'self',
  false
FROM employees
WHERE role = 'staff'
ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;

-- 同儕評記錄（員工互相評分）
-- 張三評李四
INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
VALUES 
  ('SESSION_ID', 'EMP_ID_1', 'EMP_ID_2', 'peer', false)
ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;

-- 李四評張三
INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
VALUES 
  ('SESSION_ID', 'EMP_ID_2', 'EMP_ID_1', 'peer', false)
ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
*/

-- ============================================
-- 快速查詢：取得所有需要的 ID
-- ============================================

-- 查詢所有員工及其 ID
SELECT 
  id as employee_id,
  name,
  email,
  role,
  auth_user_id
FROM employees
ORDER BY role, name;

-- 查詢所有場次及其 ID
SELECT 
  id as session_id,
  name,
  status,
  start_at,
  end_at
FROM evaluation_sessions
ORDER BY created_at DESC;

-- ============================================
-- 完成後驗證
-- ============================================

-- 檢查員工資料
SELECT COUNT(*) as employee_count FROM employees;

-- 檢查場次資料
SELECT COUNT(*) as session_count FROM evaluation_sessions;

-- 檢查評鑑記錄
SELECT COUNT(*) as record_count FROM evaluation_records;

-- ============================================
-- 完成！
-- ============================================

