-- ============================================
-- ab360 設定驗證腳本
-- ============================================
-- 
-- 使用說明：
-- 執行此腳本可以檢查系統設定是否正確
--
-- ============================================

-- 1. 檢查 RLS 是否已啟用
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('employees', 'evaluation_sessions', 'evaluation_records', 'evaluation_scores', 'evaluation_comments', 'ai_feedback')
ORDER BY tablename;

-- 2. 檢查 RLS 政策數量
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 3. 檢查員工資料
SELECT 
  id,
  name,
  email,
  role,
  department,
  CASE 
    WHEN auth_user_id IS NULL THEN '❌ 缺少 auth_user_id'
    ELSE '✅'
  END as status
FROM employees
ORDER BY role, name;

-- 4. 檢查場次資料
SELECT 
  id,
  name,
  status,
  start_at,
  end_at,
  created_at
FROM evaluation_sessions
ORDER BY created_at DESC;

-- 5. 檢查評鑑記錄數量
SELECT 
  es.name as session_name,
  COUNT(er.id) as record_count,
  COUNT(CASE WHEN er.type = 'self' THEN 1 END) as self_count,
  COUNT(CASE WHEN er.type = 'peer' THEN 1 END) as peer_count,
  COUNT(CASE WHEN er.type = 'manager' THEN 1 END) as manager_count
FROM evaluation_sessions es
LEFT JOIN evaluation_records er ON es.id = er.session_id
GROUP BY es.id, es.name
ORDER BY es.created_at DESC;

-- 6. 檢查已完成的評鑑數量
SELECT 
  COUNT(DISTINCT er.id) as total_records,
  COUNT(DISTINCT es.record_id) as completed_records,
  ROUND(COUNT(DISTINCT es.record_id)::numeric / NULLIF(COUNT(DISTINCT er.id), 0) * 100, 2) as completion_rate
FROM evaluation_records er
LEFT JOIN evaluation_scores es ON er.id = es.record_id;

-- 7. 檢查每個員工的任務數量
SELECT 
  e.name as employee_name,
  e.role,
  COUNT(CASE WHEN er.type = 'self' AND er.evaluator_id = e.id THEN 1 END) as self_tasks,
  COUNT(CASE WHEN er.type = 'peer' AND er.evaluator_id = e.id THEN 1 END) as peer_tasks,
  COUNT(CASE WHEN er.type = 'manager' AND er.evaluator_id = e.id THEN 1 END) as manager_tasks
FROM employees e
LEFT JOIN evaluation_records er ON e.id = er.evaluator_id
LEFT JOIN evaluation_sessions es ON er.session_id = es.id AND es.status = 'open'
GROUP BY e.id, e.name, e.role
ORDER BY e.role, e.name;

-- ============================================
-- 預期結果：
-- ============================================
-- 1. 所有 6 個資料表的 rls_enabled 應該都是 true
-- 2. 應該有至少 10+ 個 RLS 政策
-- 3. 應該有至少 1 個管理員和 2 個員工
-- 4. 應該有至少 1 個「進行中」的場次
-- 5. 應該有評鑑記錄（自評和同儕評）
-- ============================================

