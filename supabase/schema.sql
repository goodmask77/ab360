-- ============================================
-- ab360 評鑑系統 - 資料庫 Schema
-- ============================================
-- 
-- 使用說明：
-- 1. 請將此檔案內容複製到 Supabase Dashboard 的 SQL Editor
-- 2. 執行此 SQL 腳本以建立所有必要的資料表
-- 3. 建議在執行前先備份現有資料（如果有的話）
--
-- ============================================

-- 1. employees（員工主檔）
-- 用途：記錄每位夥伴的基本資料，登入會對應到 Supabase Auth user
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID NOT NULL UNIQUE,  -- 對應 Supabase Auth 的 user.id
  name TEXT NOT NULL,                 -- 真實姓名（在後台建立帳號時填）
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'staff', -- 'staff' / 'manager' / 'owner'
  department TEXT,                    -- 'front' / 'back' 等
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引以加速查詢
CREATE INDEX IF NOT EXISTS idx_employees_auth_user_id ON employees(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);

-- 2. evaluation_sessions（評鑑場次）
-- 用途：像「2025/04 月度 360 評鑑」
CREATE TABLE IF NOT EXISTS evaluation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,                   -- 例如：「2025/04 月度 360」
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft' / 'open' / 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_evaluation_sessions_status ON evaluation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_evaluation_sessions_dates ON evaluation_sessions(start_at, end_at);

-- 3. evaluation_records（單次「誰評誰」）
-- 用途：每一筆「A 對 B 的一份填答」
CREATE TABLE IF NOT EXISTS evaluation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
  evaluator_id UUID NOT NULL REFERENCES employees(id),  -- 真實評分人（後台看得到）
  target_id UUID NOT NULL REFERENCES employees(id),     -- 被評人
  type TEXT NOT NULL,          -- 'self' / 'peer' / 'manager'
  is_named BOOLEAN NOT NULL DEFAULT FALSE,   -- 是否「對當事人具名」
  display_name_for_target TEXT,             -- 若具名，給被評者看到的名稱（可與真名不同）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 防止同一人在同一場次對同一人重複評分（自評除外）
  CONSTRAINT unique_evaluation_record UNIQUE (session_id, evaluator_id, target_id, type)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_evaluation_records_session_id ON evaluation_records(session_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_records_evaluator_id ON evaluation_records(evaluator_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_records_target_id ON evaluation_records(target_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_records_type ON evaluation_records(type);

-- 4. evaluation_scores（各維度分數）
-- 用途：每一筆 record 對應的多個評分維度
CREATE TABLE IF NOT EXISTS evaluation_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES evaluation_records(id) ON DELETE CASCADE,
  dimension_code TEXT NOT NULL,   -- 例如：'attendance'、'attitude'、'teamwork'...
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
  -- 防止同一 record 對同一維度重複評分
  CONSTRAINT unique_dimension_score UNIQUE (record_id, dimension_code)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_record_id ON evaluation_scores(record_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_scores_dimension_code ON evaluation_scores(dimension_code);

-- 5. evaluation_comments（文字回饋）
-- 用途：對某一筆「誰評誰」的文字補充
CREATE TABLE IF NOT EXISTS evaluation_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID NOT NULL REFERENCES evaluation_records(id) ON DELETE CASCADE,
  positive_text TEXT,        -- 欣賞的地方（正向）
  suggest_text TEXT,         -- 建議或希望改善的地方
  -- 每個 record 只應該有一筆 comments
  CONSTRAINT unique_evaluation_comment UNIQUE (record_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_evaluation_comments_record_id ON evaluation_comments(record_id);

-- 6. ai_feedback（AI 統整後的建議）
-- 用途：當本期評鑑完成後，系統會基於所有紀錄產生一段「給該員看的總結＋建議」
CREATE TABLE IF NOT EXISTS ai_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
  target_id UUID NOT NULL REFERENCES employees(id),    -- 這份建議是給誰的
  ai_text TEXT,               -- AI 原始生成版本
  final_text TEXT,            -- 管理者審核後版本（可手改、補充）
  reviewed_by_manager BOOLEAN NOT NULL DEFAULT FALSE,
  generated_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- 每個人在每個場次只應該有一份 AI feedback
  CONSTRAINT unique_ai_feedback UNIQUE (session_id, target_id)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_ai_feedback_session_id ON ai_feedback(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_target_id ON ai_feedback(target_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_reviewed ON ai_feedback(reviewed_by_manager);

-- ============================================
-- 完成！所有資料表已建立
-- ============================================

