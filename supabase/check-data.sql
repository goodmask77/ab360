-- ============================================
-- 檢查資料是否正確建立
-- ============================================

-- 1. 檢查員工資料
SELECT '=== 員工資料 ===' as info;
SELECT id, name, email, role, auth_user_id
FROM employees
ORDER BY role, name;

-- 2. 檢查場次資料
SELECT '=== 場次資料 ===' as info;
SELECT id, name, status, start_at, end_at, created_at
FROM evaluation_sessions
ORDER BY created_at DESC;

-- 3. 檢查評鑑記錄
SELECT '=== 評鑑記錄 ===' as info;
SELECT 
  er.id,
  er.type,
  er.evaluator_id,
  er.target_id,
  e1.name as evaluator_name,
  e2.name as target_name,
  es.name as session_name,
  es.status as session_status
FROM evaluation_records er
LEFT JOIN employees e1 ON er.evaluator_id = e1.id
LEFT JOIN employees e2 ON er.target_id = e2.id
LEFT JOIN evaluation_sessions es ON er.session_id = es.id
ORDER BY es.created_at DESC, er.type;

-- 4. 檢查特定員工的評鑑記錄（goodmask77@gmail.com）
SELECT '=== goodmask77 的評鑑記錄 ===' as info;
SELECT 
  er.id,
  er.type,
  er.evaluator_id,
  er.target_id,
  e1.name as evaluator_name,
  e2.name as target_name,
  es.name as session_name,
  es.status as session_status
FROM evaluation_records er
JOIN employees e1 ON er.evaluator_id = e1.id
LEFT JOIN employees e2 ON er.target_id = e2.id
JOIN evaluation_sessions es ON er.session_id = es.id
WHERE e1.email = 'goodmask77@gmail.com'
ORDER BY es.created_at DESC, er.type;

-- 5. 檢查進行中的場次和記錄數量
SELECT '=== 進行中場次的統計 ===' as info;
SELECT 
  es.id,
  es.name,
  es.status,
  COUNT(er.id) as total_records,
  COUNT(CASE WHEN er.type = 'self' THEN 1 END) as self_count,
  COUNT(CASE WHEN er.type = 'peer' THEN 1 END) as peer_count
FROM evaluation_sessions es
LEFT JOIN evaluation_records er ON es.id = er.session_id
WHERE es.status = 'open'
GROUP BY es.id, es.name, es.status;

