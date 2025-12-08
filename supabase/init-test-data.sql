-- ============================================
-- 初始化測試資料
-- ============================================
-- 
-- 使用說明：
-- 1. 先在 Supabase Dashboard 的 Authentication 中手動建立測試帳號
-- 2. 將對應的 user.id 填入下方 SQL
-- 3. 執行此 SQL 腳本
--
-- ============================================

-- 範例：建立測試員工
-- 請將 'YOUR_AUTH_USER_ID_1' 替換為實際的 Supabase Auth user.id

-- 管理員帳號（owner）
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_AUTH_USER_ID_1', '管理員', 'admin@example.com', 'owner', 'management')
ON CONFLICT (auth_user_id) DO NOTHING;

-- 一般員工帳號（staff）
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES 
  ('YOUR_AUTH_USER_ID_2', '張三', 'zhang@example.com', 'staff', 'front'),
  ('YOUR_AUTH_USER_ID_3', '李四', 'li@example.com', 'staff', 'back'),
  ('YOUR_AUTH_USER_ID_4', '王五', 'wang@example.com', 'staff', 'front')
ON CONFLICT (auth_user_id) DO NOTHING;

-- 建立測試評鑑場次
INSERT INTO evaluation_sessions (name, start_at, end_at, status)
VALUES 
  ('2025/04 月度 360', '2025-04-01', '2025-04-30', 'open'),
  ('2025/03 月度 360', '2025-03-01', '2025-03-31', 'closed')
ON CONFLICT DO NOTHING;

-- 建立評鑑記錄（需要先取得 employees 和 evaluation_sessions 的 ID）
-- 請根據實際情況調整 employee_id 和 session_id

-- 範例：為場次建立自評和同儕評記錄
-- 假設 session_id 是 'SESSION_ID_1'，employee_id 分別是 'EMP_ID_1', 'EMP_ID_2', 'EMP_ID_3'

-- 自評記錄
-- INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
-- VALUES 
--   ('SESSION_ID_1', 'EMP_ID_1', 'EMP_ID_1', 'self', false),
--   ('SESSION_ID_1', 'EMP_ID_2', 'EMP_ID_2', 'self', false),
--   ('SESSION_ID_1', 'EMP_ID_3', 'EMP_ID_3', 'self', false);

-- 同儕評記錄（互相評分）
-- INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
-- VALUES 
--   ('SESSION_ID_1', 'EMP_ID_1', 'EMP_ID_2', 'peer', false),
--   ('SESSION_ID_1', 'EMP_ID_1', 'EMP_ID_3', 'peer', false),
--   ('SESSION_ID_1', 'EMP_ID_2', 'EMP_ID_1', 'peer', false),
--   ('SESSION_ID_1', 'EMP_ID_2', 'EMP_ID_3', 'peer', false),
--   ('SESSION_ID_1', 'EMP_ID_3', 'EMP_ID_1', 'peer', false),
--   ('SESSION_ID_1', 'EMP_ID_3', 'EMP_ID_2', 'peer', false);

-- ============================================
-- 完成！
-- ============================================

