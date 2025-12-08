-- ============================================
-- 快速修復 RLS 無限遞迴問題（最簡單方法）
-- ============================================
-- 
-- 執行此腳本即可修復無限遞迴問題
--
-- ============================================

-- 步驟 1: 刪除有問題的政策
DROP POLICY IF EXISTS "Users can read own employee data" ON employees;
DROP POLICY IF EXISTS "Admins can read all employees" ON employees;
DROP POLICY IF EXISTS "Admins can insert employees" ON employees;
DROP POLICY IF EXISTS "Admins can update employees" ON employees;

-- 步驟 2: 刪除舊的函數（如果存在）
DROP FUNCTION IF EXISTS is_admin_user();

-- 步驟 3: 建立安全函數（避免遞迴）
CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- 使用 security definer 直接查詢，繞過 RLS
  SELECT role INTO user_role
  FROM employees
  WHERE auth_user_id = auth.uid()
  LIMIT 1;
  
  RETURN COALESCE(user_role IN ('manager', 'owner'), false);
END;
$$;

-- 步驟 4: 重新建立政策（使用函數避免遞迴）

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
-- 驗證修復
-- ============================================

-- 檢查函數是否建立成功
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc
WHERE proname = 'is_admin_user';

-- 檢查政策是否建立成功
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies
WHERE tablename = 'employees'
ORDER BY policyname;

-- ============================================
-- 完成！
-- ============================================
-- 
-- 現在應該不會再出現無限遞迴錯誤
-- 請重新測試登入功能
--

