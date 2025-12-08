# 🚀 快速建立測試帳號（最簡單方法）

## 步驟 1：在 Supabase Dashboard 建立帳號

前往 **Authentication** → **Users** → **Add user** → **Create new user**

逐一建立以下 9 個帳號（每個帳號建立時**務必勾選 Auto Confirm User**）：

### 員工帳號（8 個）

1. **Email**: `zhang@ab360.com`  
   **Password**: `zhang123`

2. **Email**: `li@ab360.com`  
   **Password**: `li123`

3. **Email**: `wang@ab360.com`  
   **Password**: `wang123`

4. **Email**: `chen@ab360.com`  
   **Password**: `chen123`

5. **Email**: `lin@ab360.com`  
   **Password**: `lin123`

6. **Email**: `huang@ab360.com`  
   **Password**: `huang123`

7. **Email**: `wu@ab360.com`  
   **Password**: `wu123`

8. **Email**: `zhou@ab360.com`  
   **Password**: `zhou123`

### 主管帳號（1 個）

9. **Email**: `manager@ab360.com`  
   **Password**: `manager123`

---

## 步驟 2：驗證使用者已建立

在 **Authentication** → **Users** 中，應該看到所有 11 個使用者：
- admin@example.com（已存在）
- goodmask77@gmail.com（已存在）
- 加上上述 9 個新帳號

---

## 步驟 3：執行測試資料腳本

1. 前往 **SQL Editor**
2. 開啟 `supabase/quick-setup.sql`
3. 執行腳本
4. 腳本會自動建立所有員工資料、場次和評鑑記錄

---

## 完成！

現在可以使用以下帳號測試系統：

- **管理員**: `admin@example.com` / `你的密碼`
- **主管**: `manager@ab360.com` / `manager123`
- **員工**: `zhang@ab360.com` / `zhang123`（或其他員工帳號）

