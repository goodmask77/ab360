-- ============================================
-- 修復 employees 表的 RLS 政策無限遞迴問題
-- ============================================
-- 
-- 問題：管理員政策在檢查時又查詢 employees 表，造成無限遞迴
-- 解決：使用 security definer 函數來檢查管理員權限
--
-- ============================================

-- 刪除舊的政策
DROP POLICY IF EXISTS "Users can read own employee data" ON employees;
DROP POLICY IF EXISTS "Admins can read all employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;

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

-- 重新建立政策（使用函數避免遞迴）

-- 允許使用者讀取自己的員工資料
CREATE POLICY "Users can read own employee data"
ON employees FOR SELECT
USING (auth.uid() = auth_user_id);

-- 允許管理員讀取所有員工資料（使用函數避免遞迴）
CREATE POLICY "Admins can read all employees"
ON employees FOR SELECT
USING (is_admin_user());

-- 允許管理員建立員工資料
CREATE POLICY "Admins can insert employees"
ON employees FOR INSERT
WITH CHECK (is_admin_user());

-- 允許管理員更新員工資料
CREATE POLICY "Admins can update employees"
ON employees FOR UPDATE
USING (is_admin_user());

-- ============================================
-- 完成！
-- ============================================
-- 
-- 現在 RLS 政策應該不會再出現無限遞迴錯誤
-- 請重新測試登入功能
--

