-- ============================================
-- ab360 評鑑系統 - Demo 虛擬評分資料
-- ============================================
-- 
-- 此檔案建立虛擬的評分資料，方便 demo 展示
-- 包含：員工、場次、題目、評分記錄、答案等
-- 
-- 使用方式：在 Supabase SQL Editor 執行此檔案
--
-- ============================================

-- 注意：執行前請確保已執行過：
-- 1. schema.sql
-- 2. schema-extensions.sql
-- 3. seed-default-questions.sql（或手動建立題目）

-- ============================================
-- 步驟1：建立 Demo 場次（如果還沒有）
-- ============================================

DO $$
DECLARE
  demo_session_id UUID;
  emp_ids UUID[];
  emp_count INTEGER;
BEGIN
  -- 檢查是否已有 demo 場次
  SELECT id INTO demo_session_id
  FROM evaluation_sessions
  WHERE name = '2025/04 月度 360 Demo'
  LIMIT 1;

  -- 如果沒有，建立一個
  IF demo_session_id IS NULL THEN
    INSERT INTO evaluation_sessions (name, start_at, end_at, status)
    VALUES (
      '2025/04 月度 360 Demo',
      NOW() - INTERVAL '7 days',
      NOW() + INTERVAL '23 days',
      'open'
    )
    RETURNING id INTO demo_session_id;
    
    RAISE NOTICE '已建立 Demo 場次: %', demo_session_id;
  ELSE
    RAISE NOTICE '使用現有 Demo 場次: %', demo_session_id;
  END IF;

  -- ============================================
  -- 步驟2：取得所有員工 ID
  -- ============================================
  
  SELECT ARRAY_AGG(id), COUNT(*) INTO emp_ids, emp_count
  FROM employees
  WHERE role IN ('staff', 'manager');

  IF emp_count = 0 THEN
    RAISE NOTICE '沒有員工資料，請先建立員工';
    RETURN;
  END IF;

  RAISE NOTICE '找到 % 位員工', emp_count;

  -- ============================================
  -- 步驟3：為每位員工建立自評和互評 assignments
  -- ============================================
  
  -- 先刪除該場次的舊 assignments（如果有的話）
  DELETE FROM evaluation_assignments WHERE session_id = demo_session_id;

  -- 建立自評 assignments
  INSERT INTO evaluation_assignments (session_id, evaluator_id, target_id, is_self, status)
  SELECT 
    demo_session_id,
    id,
    id,
    true,
    'completed'
  FROM employees
  WHERE role IN ('staff', 'manager')
  ON CONFLICT DO NOTHING;

  -- 建立同部門互評 assignments（每位員工評同部門的其他員工）
  INSERT INTO evaluation_assignments (session_id, evaluator_id, target_id, is_self, status)
  SELECT 
    demo_session_id,
    e1.id,
    e2.id,
    false,
    CASE WHEN random() > 0.3 THEN 'completed' ELSE 'pending' END
  FROM employees e1
  CROSS JOIN employees e2
  WHERE e1.id != e2.id
    AND e1.department = e2.department
    AND e1.role IN ('staff', 'manager')
    AND e2.role IN ('staff', 'manager')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '已建立 assignments';

  -- ============================================
  -- 步驟4：為已完成的 assignments 建立評分記錄
  -- ============================================
  
  -- 取得所有已完成的 assignments
  FOR emp_id IN SELECT evaluator_id FROM evaluation_assignments 
    WHERE session_id = demo_session_id AND status = 'completed'
    GROUP BY evaluator_id
  LOOP
    DECLARE
      target_emp_id UUID;
      is_self_assignment BOOLEAN;
      record_id_var UUID;
      question_rec RECORD;
      score_value INTEGER;
      comment_text TEXT;
    BEGIN
      -- 為每個已完成的 assignment 建立記錄
      FOR target_emp_id, is_self_assignment IN 
        SELECT target_id, is_self 
        FROM evaluation_assignments 
        WHERE session_id = demo_session_id 
          AND evaluator_id = emp_id 
          AND status = 'completed'
      LOOP
        -- 建立 evaluation_record
        INSERT INTO evaluation_records (
          session_id,
          evaluator_id,
          target_id,
          type,
          is_named,
          display_name_for_target
        )
        VALUES (
          demo_session_id,
          emp_id,
          target_emp_id,
          CASE WHEN is_self_assignment THEN 'self' ELSE 'peer' END,
          CASE WHEN is_self_assignment THEN true ELSE random() > 0.5 END, -- 互評隨機具名/匿名
          NULL
        )
        RETURNING id INTO record_id_var;

        -- 為每道題目建立答案
        FOR question_rec IN 
          SELECT id, type, category
          FROM questions
          WHERE session_id = demo_session_id
          ORDER BY order_index
        LOOP
          IF question_rec.type = 'scale_1_5' THEN
            -- 分數題：生成 3-5 之間的分數（稍微偏向高分，模擬正面評分）
            score_value := 3 + floor(random() * 3)::INTEGER;
            
            INSERT INTO evaluation_answers (record_id, question_id, answer_value)
            VALUES (record_id_var, question_rec.id, score_value::TEXT)
            ON CONFLICT DO NOTHING;
          ELSE
            -- 文字題：生成範例回饋
            comment_text := CASE question_rec.category
              WHEN '綜合印象與建議' THEN 
                CASE 
                  WHEN random() > 0.7 THEN '你真的很棒！繼續保持！'
                  WHEN random() > 0.4 THEN '在團隊合作上表現很好，希望可以多主動溝通。'
                  ELSE '感謝你的付出，一起變強！'
                END
              ELSE NULL
            END;
            
            IF comment_text IS NOT NULL THEN
              INSERT INTO evaluation_answers (record_id, question_id, answer_value)
              VALUES (record_id_var, question_rec.id, comment_text)
              ON CONFLICT DO NOTHING;
            END IF;
          END IF;
        END LOOP;

        -- 建立文字回饋（evaluation_comments）
        INSERT INTO evaluation_comments (record_id, positive_text, suggest_text)
        VALUES (
          record_id_var,
          CASE WHEN random() > 0.3 THEN 
            '工作態度積極，團隊合作佳，是很好的夥伴！'
          ELSE NULL END,
          CASE WHEN random() > 0.5 THEN 
            '建議可以多主動溝通，讓團隊運作更順暢。'
          ELSE NULL END
        )
        ON CONFLICT DO NOTHING;
      END LOOP;
    END;
  END LOOP;

  RAISE NOTICE '已建立評分記錄和答案';

END $$;

-- ============================================
-- 完成！Demo 資料已建立
-- ============================================
-- 
-- 現在可以：
-- 1. 登入系統查看評鑑任務
-- 2. 查看個人分析頁面
-- 3. 查看後台管理頁面
-- ============================================

