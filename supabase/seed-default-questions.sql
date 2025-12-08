-- ============================================
-- ab360 評鑑系統 - 預設10道評鑑題目
-- ============================================
-- 
-- 此檔案包含10道針對「餐飲業基層內外場夥伴」的評鑑題目
-- 題目設計原則：自然、有溫度、容易理解
-- 
-- 使用方式：
-- 1. 在 Supabase SQL Editor 執行此檔案
-- 2. 需要先有一個 evaluation_session 的 ID
-- 3. 將 YOUR_SESSION_ID 替換為實際的 session_id
--
-- ============================================

-- 注意：執行前請先取得一個 evaluation_session 的 ID
-- 範例：SELECT id FROM evaluation_sessions WHERE name = '2025/04 月度 360' LIMIT 1;

-- 如果沒有 session，可以先建立一個：
-- INSERT INTO evaluation_sessions (name, start_at, end_at, status)
-- VALUES ('2025/04 月度 360', NOW(), NOW() + INTERVAL '30 days', 'open')
-- RETURNING id;

-- 然後將下面的 YOUR_SESSION_ID 替換為實際的 session_id

-- ============================================
-- 10道評鑑題目
-- ============================================

-- 題目1：出勤與守時
INSERT INTO questions (session_id, category, order_index, question_text, type, target_type, for_department)
SELECT 
  id as session_id,
  '出勤與守時' as category,
  1 as order_index,
  '這位夥伴上班準時，願意支援臨時調班，出勤狀況穩定。' as question_text,
  'scale_1_5' as type,
  'both' as target_type,
  'all' as for_department
FROM evaluation_sessions 
WHERE status = 'open' 
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 題目2：工作態度
INSERT INTO questions (session_id, category, order_index, question_text, type, target_type, for_department)
SELECT 
  id as session_id,
  '工作態度' as category,
  2 as order_index,
  '遇到麻煩的客人或突發狀況時，這位夥伴仍能保持專業與冷靜，積極解決問題。' as question_text,
  'scale_1_5' as type,
  'both' as target_type,
  'all' as for_department
FROM evaluation_sessions 
WHERE status = 'open' 
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 題目3：團隊合作
INSERT INTO questions (session_id, category, order_index, question_text, type, target_type, for_department)
SELECT 
  id as session_id,
  '團隊合作' as category,
  3 as order_index,
  '在忙碌時願意主動幫助同事，互相 cover，讓團隊運作更順暢。' as question_text,
  'scale_1_5' as type,
  'both' as target_type,
  'all' as for_department
FROM evaluation_sessions 
WHERE status = 'open' 
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 題目4：溝通與回報
INSERT INTO questions (session_id, category, order_index, question_text, type, target_type, for_department)
SELECT 
  id as session_id,
  '溝通與回報' as category,
  4 as order_index,
  '能清楚傳遞資訊，遇到問題會主動回報，不會隱瞞或拖延。' as question_text,
  'scale_1_5' as type,
  'both' as target_type,
  'all' as for_department
FROM evaluation_sessions 
WHERE status = 'open' 
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 題目5：學習與成長
INSERT INTO questions (session_id, category, order_index, question_text, type, target_type, for_department)
SELECT 
  id as session_id,
  '學習與成長' as category,
  5 as order_index,
  '願意學新東西，接受指正並調整做法，持續進步。' as question_text,
  'scale_1_5' as type,
  'both' as target_type,
  'all' as for_department
FROM evaluation_sessions 
WHERE status = 'open' 
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 題目6：服務細節（外場專用）
INSERT INTO questions (session_id, category, order_index, question_text, type, target_type, for_department)
SELECT 
  id as session_id,
  '服務細節' as category,
  6 as order_index,
  '點餐、送餐、收桌等細節是否到位，能關注客人需求。' as question_text,
  'scale_1_5' as type,
  'both' as target_type,
  'front' as for_department
FROM evaluation_sessions 
WHERE status = 'open' 
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 題目7：出餐品質（內場專用）
INSERT INTO questions (session_id, category, order_index, question_text, type, target_type, for_department)
SELECT 
  id as session_id,
  '出餐品質' as category,
  7 as order_index,
  '餐點品質穩定、擺盤與出餐速度符合標準。' as question_text,
  'scale_1_5' as type,
  'both' as target_type,
  'back' as for_department
FROM evaluation_sessions 
WHERE status = 'open' 
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 題目8：衛生與安全
INSERT INTO questions (session_id, category, order_index, question_text, type, target_type, for_department)
SELECT 
  id as session_id,
  '衛生與安全' as category,
  8 as order_index,
  '在衛生、安全規範上的遵守程度，能維護工作環境的整潔與安全。' as question_text,
  'scale_1_5' as type,
  'both' as target_type,
  'all' as for_department
FROM evaluation_sessions 
WHERE status = 'open' 
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 題目9：責任感
INSERT INTO questions (session_id, category, order_index, question_text, type, target_type, for_department)
SELECT 
  id as session_id,
  '責任感' as category,
  9 as order_index,
  '對自己負責的工作有「做完／做好」的意識，不會敷衍了事。' as question_text,
  'scale_1_5' as type,
  'both' as target_type,
  'all' as for_department
FROM evaluation_sessions 
WHERE status = 'open' 
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- 題目10：綜合印象與建議（文字題）
INSERT INTO questions (session_id, category, order_index, question_text, type, target_type, for_department)
SELECT 
  id as session_id,
  '綜合印象與建議' as category,
  10 as order_index,
  '給這位夥伴一句具體的鼓勵或建議，幫助他一起變強。' as question_text,
  'text' as type,
  'both' as target_type,
  'all' as for_department
FROM evaluation_sessions 
WHERE status = 'open' 
ORDER BY created_at DESC 
LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- 完成！10道題目已建立
-- ============================================
-- 
-- 注意：此腳本會自動找到最新的 'open' 狀態的 session
-- 如果沒有 open 的 session，請先建立一個
-- ============================================


