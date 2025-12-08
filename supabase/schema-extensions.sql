-- ============================================
-- ab360 評鑑系統 - Schema 擴充
-- ============================================
-- 
-- 此檔案包含新增的資料表，用於支援完整的評鑑功能
-- 請在執行完 schema.sql 後執行此檔案
--
-- ============================================

-- 7. questions（題目管理）
-- 用途：每個 session 的評鑑題目
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
  category TEXT NOT NULL,              -- 例如：「工作態度」、「團隊合作」、「專業能力」、「穩定度」
  order_index INTEGER NOT NULL DEFAULT 0, -- 排序索引
  question_text TEXT NOT NULL,          -- 題目文字
  type TEXT NOT NULL,                   -- 'scale_1_5' | 'text'
  target_type TEXT NOT NULL,            -- 'self' | 'peer' | 'both'
  for_department TEXT,                  -- 'front' | 'back' | 'all'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_questions_session_id ON questions(session_id);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_order ON questions(session_id, order_index);

-- 8. evaluation_assignments（評鑑任務分配）
-- 用途：追蹤評鑑任務的分配和完成狀態
CREATE TABLE IF NOT EXISTS evaluation_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES employees(id),  -- 評分人
  target_id UUID NOT NULL REFERENCES employees(id),     -- 被評人
  is_self BOOLEAN NOT NULL DEFAULT FALSE,               -- 是否為自評
  status TEXT NOT NULL DEFAULT 'pending',                -- 'pending' | 'completed'
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 防止重複分配
  CONSTRAINT unique_evaluation_assignment UNIQUE (session_id, evaluator_id, target_id, is_self)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_evaluation_assignments_session_id ON evaluation_assignments(session_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_assignments_evaluator_id ON evaluation_assignments(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_assignments_target_id ON evaluation_assignments(target_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_assignments_status ON evaluation_assignments(status);

-- 9. evaluation_answers（答案儲存）
-- 用途：儲存每題的具體答案
CREATE TABLE IF NOT EXISTS evaluation_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES evaluation_records(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_value TEXT,                   -- 文字答案或分數（1-5）的字串形式
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- 防止同一 record 對同一題目重複回答
  CONSTRAINT unique_evaluation_answer UNIQUE (record_id, question_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_evaluation_answers_record_id ON evaluation_answers(record_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_answers_question_id ON evaluation_answers(question_id);

-- ============================================
-- 完成！所有擴充資料表已建立
-- ============================================

