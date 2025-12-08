-- ============================================
-- ab360 評鑑系統 - 積分投票系統 Schema
-- ============================================
-- 
-- 此檔案包含積分投票與排行榜系統的資料表
-- 請在執行完 schema.sql 和 schema-extensions.sql 後執行此檔案
--
-- ============================================

-- 1. reward_categories（積分類別）
-- 用途：定義各種積分類別（團隊幫手王、救火王等）
CREATE TABLE IF NOT EXISTS reward_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,              -- 'team_player', 'firefighter' 等
  name TEXT NOT NULL,                   -- '團隊幫手王', '班表救火王' 等
  description TEXT,                     -- 類別說明
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_reward_categories_key ON reward_categories(key);
CREATE INDEX IF NOT EXISTS idx_reward_categories_active ON reward_categories(is_active);

-- 2. reward_points_ledger（積分投票記錄）
-- 用途：記錄每一筆積分投票（誰投給誰、哪個類別、多少點）
CREATE TABLE IF NOT EXISTS reward_points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES evaluation_sessions(id) ON DELETE CASCADE,
  giver_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,    -- 投票人
  receiver_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE, -- 被投票人
  category_key TEXT NOT NULL,                                          -- 類別 key
  points INTEGER NOT NULL CHECK (points >= 5 AND points <= 30),        -- 投票點數（5-30）
  created_at TIMESTAMPTZ DEFAULT NOW(),
  -- 約束：不能投給自己
  CONSTRAINT check_no_self_vote CHECK (giver_id != receiver_id),
  -- 約束：確保 category_key 存在於 reward_categories
  CONSTRAINT fk_reward_category FOREIGN KEY (category_key) REFERENCES reward_categories(key)
);

-- 建立索引
CREATE INDEX IF NOT EXISTS idx_reward_points_session_id ON reward_points_ledger(session_id);
CREATE INDEX IF NOT EXISTS idx_reward_points_giver_id ON reward_points_ledger(giver_id);
CREATE INDEX IF NOT EXISTS idx_reward_points_receiver_id ON reward_points_ledger(receiver_id);
CREATE INDEX IF NOT EXISTS idx_reward_points_category ON reward_points_ledger(category_key);
CREATE INDEX IF NOT EXISTS idx_reward_points_created_at ON reward_points_ledger(created_at);

-- 3. 擴充 evaluation_sessions 表
-- 新增積分相關欄位（如果欄位不存在）
DO $$ 
BEGIN
  -- 獎金池總點數
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evaluation_sessions' AND column_name = 'reward_pool_points'
  ) THEN
    ALTER TABLE evaluation_sessions 
    ADD COLUMN reward_pool_points INTEGER DEFAULT 1000;
  END IF;

  -- 每位使用者可分配的點數
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evaluation_sessions' AND column_name = 'vote_quota_per_user'
  ) THEN
    ALTER TABLE evaluation_sessions 
    ADD COLUMN vote_quota_per_user INTEGER DEFAULT 100;
  END IF;
END $$;

-- ============================================
-- 插入預設的積分類別
-- ============================================

INSERT INTO reward_categories (key, name, description, is_active) VALUES
  ('team_player', '團隊幫手王', '在忙碌時主動支援同事，讓團隊運作更順暢', TRUE),
  ('firefighter', '班表救火王', '臨時支援、加班救援，願意挺身而出', TRUE),
  ('mood_maker', '氣氛帶動王', '讓班上氣氛好、情緒穩定，是團隊的開心果', TRUE),
  ('growth_master', '成長進步王', '本期進步明顯、學習速度快，持續成長', TRUE),
  ('service_star', '服務之星', '外場服務表現優秀，能關注客人需求', TRUE),
  ('kitchen_star', '出餐之星', '內場出餐品質穩定、速度符合標準', TRUE)
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- 完成！積分系統 Schema 已建立
-- ============================================


