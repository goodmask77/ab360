# 測試工具頁面訪問說明

## 訪問方式

### 方法 1：從管理後台進入（推薦）
1. 登入系統
2. 確保您的帳號有**管理員權限**（role 為 `manager` 或 `owner`）
3. 前往 `/admin` 管理後台
4. 點擊「🔧 測試工具」按鈕

### 方法 2：直接訪問 URL
- 直接訪問：`/admin/debug-tools`
- **注意**：需要管理員權限才能訪問

## 權限要求

- 您的員工資料（employees 表）中的 `role` 欄位必須是：
  - `manager`（經理）
  - `owner`（擁有者）

## 如果看不到「測試工具」按鈕

可能的原因：
1. **沒有管理員權限**：您的帳號 role 是 `staff`（員工）
2. **沒有員工資料**：您的 auth_user_id 在 employees 表中沒有對應記錄
3. **頁面載入中**：請等待頁面完全載入

## 解決方法

### 如果您是系統管理員：
1. 在 Supabase 資料庫中，找到 `employees` 表
2. 找到您的員工記錄（透過 `auth_user_id` 對應到您的 Supabase Auth user id）
3. 將 `role` 欄位更新為 `manager` 或 `owner`
4. 重新登入系統

### 如果您需要建立測試帳號：
可以使用 SQL 直接建立：

```sql
-- 假設您的 Supabase Auth user id 是 'your-user-id-here'
INSERT INTO employees (auth_user_id, name, email, role, department)
VALUES ('your-user-id-here', '您的姓名', 'your-email@example.com', 'owner', 'front')
ON CONFLICT (auth_user_id) DO UPDATE SET role = 'owner';
```

## 功能說明

### 生成完整虛擬數據（推薦）
- 50 位員工（含 1 位老闆、4 位經理、45 位員工）
- 3 個評鑑場次（過去已結束、現在進行中、未來預告）
- 完整的評鑑記錄、答案和文字回饋
- 豐富的積分投票記錄（每位員工 5-10 筆）
- AI 回饋數據

### 快速測試資料（20 筆）
- 20 位虛擬員工
- 1 個評鑑場次
- 20 筆評鑑記錄
- 20-50 筆積分投票

