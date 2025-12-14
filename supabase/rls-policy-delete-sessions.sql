-- ============================================
-- 添加 evaluation_sessions 表的 DELETE 政策
-- ============================================
-- 
-- 此腳本為 evaluation_sessions 表添加 DELETE 政策
-- 允許管理員（owner 和 duty）刪除場次
--
-- ============================================

-- 允許管理員刪除場次
CREATE POLICY "Admins can delete sessions"
ON evaluation_sessions FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM employees
    WHERE auth_user_id = auth.uid()
    AND role IN ('owner', 'duty')
  )
);

