-- ============================================
-- 為 goodmask77@gmail.com 建立評鑑記錄
-- ============================================
-- 
-- 此腳本會為 goodmask77@gmail.com 建立自評和同儕評記錄
--
-- ============================================

DO $$
DECLARE
  session_id_var UUID;
  goodmask77_emp_id UUID;
  other_emp_ids UUID[];
  other_emp_id UUID;
BEGIN
  -- 取得進行中的場次 ID
  SELECT id INTO session_id_var 
  FROM evaluation_sessions 
  WHERE status = 'open' 
  ORDER BY created_at DESC 
  LIMIT 1;

  IF session_id_var IS NULL THEN
    RAISE NOTICE '⚠️ 沒有找到進行中的場次！';
    RETURN;
  END IF;

  RAISE NOTICE '📝 使用場次: %', session_id_var;

  -- 取得 goodmask77@gmail.com 的員工 ID
  SELECT id INTO goodmask77_emp_id
  FROM employees
  WHERE email = 'goodmask77@gmail.com';

  IF goodmask77_emp_id IS NULL THEN
    RAISE NOTICE '⚠️ 找不到 goodmask77@gmail.com 的員工資料！';
    RETURN;
  END IF;

  RAISE NOTICE '📝 goodmask77 員工 ID: %', goodmask77_emp_id;

  -- 建立自評記錄
  INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
  VALUES (session_id_var, goodmask77_emp_id, goodmask77_emp_id, 'self', false)
  ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;

  RAISE NOTICE '✅ 已建立自評記錄';

  -- 取得其他員工 ID（用於同儕評）
  SELECT ARRAY_AGG(id) INTO other_emp_ids
  FROM employees
  WHERE role = 'staff' 
    AND id != goodmask77_emp_id
  LIMIT 3;

  -- 為 goodmask77 建立同儕評記錄（評其他員工）
  IF other_emp_ids IS NOT NULL AND array_length(other_emp_ids, 1) > 0 THEN
    FOREACH other_emp_id IN ARRAY other_emp_ids
    LOOP
      INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
      VALUES (session_id_var, goodmask77_emp_id, other_emp_id, 'peer', false)
      ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
    END LOOP;
    RAISE NOTICE '✅ 已建立 % 個同儕評記錄', array_length(other_emp_ids, 1);
  END IF;

  -- 為其他員工建立對 goodmask77 的同儕評記錄
  FOREACH other_emp_id IN ARRAY other_emp_ids
  LOOP
    INSERT INTO evaluation_records (session_id, evaluator_id, target_id, type, is_named)
    VALUES (session_id_var, other_emp_id, goodmask77_emp_id, 'peer', false)
    ON CONFLICT (session_id, evaluator_id, target_id, type) DO NOTHING;
  END LOOP;

  RAISE NOTICE '✅ 已為其他員工建立對 goodmask77 的同儕評記錄';

  RAISE NOTICE '✨ 完成！goodmask77@gmail.com 現在應該可以看到評鑑任務了';
END $$;

-- 驗證建立的記錄
SELECT 
  er.id,
  er.type,
  e1.name as evaluator_name,
  e2.name as target_name,
  es.name as session_name,
  es.status as session_status
FROM evaluation_records er
JOIN employees e1 ON er.evaluator_id = e1.id
LEFT JOIN employees e2 ON er.target_id = e2.id
JOIN evaluation_sessions es ON er.session_id = es.id
WHERE e1.email = 'goodmask77@gmail.com' OR e2.email = 'goodmask77@gmail.com'
ORDER BY er.type, es.created_at DESC;

-- ============================================
-- 完成！
-- ============================================

