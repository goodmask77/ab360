-- ============================================
-- ab360 評鑑系統 - Row Level Security (RLS) 政策（安全版本）
-- ============================================
-- 
-- 此版本會先刪除現有政策，再重新建立
-- 適合重複執行或更新政策時使用
--
-- ============================================

-- 啟用 RLS 在所有資料表上
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluation_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_feedback ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 刪除現有政策（如果存在）
-- ============================================

-- employees 表
DROP POLICY IF EXISTS "Users can read own employee data" ON employees;
DROP POLICY IF EXISTS "Admins can read all employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;

-- evaluation_sessions 表
DROP POLICY IF EXISTS "Users can read open sessions" ON evaluation_sessions;
DROP POLICY IF EXISTS "Admins can create sessions" ON evaluation_sessions;
DROP POLICY IF EXISTS "Admins can update sessions" ON evaluation_sessions;

-- evaluation_records 表
DROP POLICY IF EXISTS "Users can read own evaluation records" ON evaluation_records;
DROP POLICY IF EXISTS "Admins can create evaluation records" ON evaluation_records;
DROP POLICY IF EXISTS "Users can update own evaluation records" ON evaluation_records;

-- evaluation_scores 表
DROP POLICY IF EXISTS "Users can read own scores" ON evaluation_scores;
DROP POLICY IF EXISTS "Users can write own scores" ON evaluation_scores;

-- evaluation_comments 表
DROP POLICY IF EXISTS "Users can read own comments" ON evaluation_comments;
DROP POLICY IF EXISTS "Users can write own comments" ON evaluation_comments;

-- ai_feedback 表
DROP POLICY IF EXISTS "Users can read own ai feedback" ON ai_feedback;
DROP POLICY IF EXISTS "Admins can manage ai feedback" ON ai_feedback;

-- ============================================
-- 建立安全函數（避免 RLS 遞迴）
-- ============================================

-- 建立安全函數來檢查是否為管理員（避免遞迴）
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- 直接查詢，使用 security definer 避免 RLS 限制
  SELECT role INTO user_role
  FROM employees
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
  
  RETURN user_role IN ('manager', 'owner');
END;
$$;

-- ============================================
-- 建立新政策
-- ============================================

-- ============================================
-- employees 表的政策
-- ============================================

-- 允許使用者讀取自己的員工資料
CREATE POLICY "Users can read own employee data"
ON employees FOR SELECT
USING (auth.uid() = auth_user_id);

-- 允許管理員讀取所有員工資料（使用函數避免遞迴）
CREATE POLICY "Admins can read all employees"
ON employees FOR SELECT
USING (is_admin_user());

-- 允許管理員建立員工資料（通常由後台手動建立）
CREATE POLICY "Admins can insert employees"
ON employees FOR INSERT
WITH CHECK (is_admin_user());

-- 允許管理員更新員工資料
CREATE POLICY "Admins can update employees"
ON employees FOR UPDATE
USING (is_admin_user());

-- ============================================
-- evaluation_sessions 表的政策
-- ============================================

-- 允許所有已登入使用者讀取場次（但只能看到狀態為 open 的）
CREATE POLICY "Users can read open sessions"
ON evaluation_sessions FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    status = 'open'
    OR EXISTS (
      SELECT 1 FROM employees
      WHERE auth_user_id = auth.uid()
      AND role IN ('manager', 'owner')
    )
  )
);

-- 允許管理員建立場次
CREATE POLICY "Admins can create sessions"
ON evaluation_sessions FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees
    WHERE auth_user_id = auth.uid()
    AND role IN ('manager', 'owner')
  )
);

-- 允許管理員更新場次
CREATE POLICY "Admins can update sessions"
ON evaluation_sessions FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE auth_user_id = auth.uid()
    AND role IN ('manager', 'owner')
  )
);

-- ============================================
-- evaluation_records 表的政策
-- ============================================

-- 允許使用者讀取自己作為評分人或被評人的記錄
CREATE POLICY "Users can read own evaluation records"
ON evaluation_records FOR SELECT
USING (
  evaluator_id IN (
    SELECT id FROM employees WHERE auth_user_id = auth.uid()
  )
  OR target_id IN (
    SELECT id FROM employees WHERE auth_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM employees
    WHERE auth_user_id = auth.uid()
    AND role IN ('manager', 'owner')
  )
);

-- 允許管理員建立評鑑記錄
CREATE POLICY "Admins can create evaluation records"
ON evaluation_records FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM employees
    WHERE auth_user_id = auth.uid()
    AND role IN ('manager', 'owner')
  )
);

-- 允許使用者更新自己的評鑑記錄（作為評分人）
CREATE POLICY "Users can update own evaluation records"
ON evaluation_records FOR UPDATE
USING (
  evaluator_id IN (
    SELECT id FROM employees WHERE auth_user_id = auth.uid()
  )
);

-- ============================================
-- evaluation_scores 表的政策
-- ============================================

-- 允許使用者讀取自己評分記錄的分數
CREATE POLICY "Users can read own scores"
ON evaluation_scores FOR SELECT
USING (
  record_id IN (
    SELECT id FROM evaluation_records
    WHERE evaluator_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  )
  OR record_id IN (
    SELECT id FROM evaluation_records
    WHERE target_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM employees
    WHERE auth_user_id = auth.uid()
    AND role IN ('manager', 'owner')
  )
);

-- 允許使用者寫入自己評分記錄的分數
CREATE POLICY "Users can write own scores"
ON evaluation_scores FOR ALL
USING (
  record_id IN (
    SELECT id FROM evaluation_records
    WHERE evaluator_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  )
);

-- ============================================
-- evaluation_comments 表的政策
-- ============================================

-- 允許使用者讀取自己評分記錄的評論
CREATE POLICY "Users can read own comments"
ON evaluation_comments FOR SELECT
USING (
  record_id IN (
    SELECT id FROM evaluation_records
    WHERE evaluator_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  )
  OR record_id IN (
    SELECT id FROM evaluation_records
    WHERE target_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  )
  OR EXISTS (
    SELECT 1 FROM employees
    WHERE auth_user_id = auth.uid()
    AND role IN ('manager', 'owner')
  )
);

-- 允許使用者寫入自己評分記錄的評論
CREATE POLICY "Users can write own comments"
ON evaluation_comments FOR ALL
USING (
  record_id IN (
    SELECT id FROM evaluation_records
    WHERE evaluator_id IN (
      SELECT id FROM employees WHERE auth_user_id = auth.uid()
    )
  )
);

-- ============================================
-- ai_feedback 表的政策
-- ============================================

-- 允許使用者讀取自己的 AI 回饋
CREATE POLICY "Users can read own ai feedback"
ON ai_feedback FOR SELECT
USING (
  target_id IN (
    SELECT id FROM employees WHERE auth_user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM employees
    WHERE auth_user_id = auth.uid()
    AND role IN ('manager', 'owner')
  )
);

-- 允許管理員建立和更新 AI 回饋
CREATE POLICY "Admins can manage ai feedback"
ON ai_feedback FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE auth_user_id = auth.uid()
    AND role IN ('manager', 'owner')
  )
);

-- ============================================
-- 完成！
-- ============================================
-- 
-- 所有 RLS 政策已重新設定完成
-- 現在系統已具備基本的安全性保護
--

