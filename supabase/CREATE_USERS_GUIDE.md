# 📝 批量建立 Auth 使用者指南

## 方法 1：使用 Supabase Dashboard UI（推薦，最簡單）

### 步驟 1：前往 Authentication → Users

1. 登入 Supabase Dashboard
2. 點擊左側選單的 **Authentication** → **Users**
3. 點擊右上角的 **Add user** → **Create new user**

### 步驟 2：建立以下 8 個帳號

逐一建立以下帳號（每個帳號建立時請勾選 **Auto Confirm User**）：

| # | Email | Password | 角色 |
|---|-------|----------|------|
| 1 | zhang@ab360.com | zhang123 | staff |
| 2 | li@ab360.com | li123 | staff |
| 3 | wang@ab360.com | wang123 | staff |
| 4 | chen@ab360.com | chen123 | staff |
| 5 | lin@ab360.com | lin123 | staff |
| 6 | huang@ab360.com | huang123 | staff |
| 7 | wu@ab360.com | wu123 | staff |
| 8 | zhou@ab360.com | zhou123 | staff |
| 9 | manager@ab360.com | manager123 | manager |

### 快速建立技巧

1. 開啟瀏覽器開發者工具（F12）
2. 在 Console 中執行以下 JavaScript（需要先登入 Supabase Dashboard）：

```javascript
// 注意：這需要在 Supabase Dashboard 的頁面上執行
// 且需要適當的權限

const users = [
  { email: 'zhang@ab360.com', password: 'zhang123' },
  { email: 'li@ab360.com', password: 'li123' },
  { email: 'wang@ab360.com', password: 'wang123' },
  { email: 'chen@ab360.com', password: 'chen123' },
  { email: 'lin@ab360.com', password: 'lin123' },
  { email: 'huang@ab360.com', password: 'huang123' },
  { email: 'wu@ab360.com', password: 'wu123' },
  { email: 'zhou@ab360.com', password: 'zhou123' },
  { email: 'manager@ab360.com', password: 'manager123' },
];

// 注意：這只是範例，實際需要透過 Supabase API
// 建議還是使用 Dashboard UI 或 CLI
```

---

## 方法 2：使用 Supabase CLI（適合開發者）

### 步驟 1：安裝 Supabase CLI

```bash
npm install -g supabase
```

### 步驟 2：登入 Supabase

```bash
supabase login
```

這會開啟瀏覽器讓你登入。

### 步驟 3：連結專案

```bash
supabase link --project-ref hhwkxjqjpnejozbytaow
```

### 步驟 4：執行批量建立腳本

```bash
# 給予執行權限
chmod +x supabase/create-users-batch.sh

# 執行腳本
bash supabase/create-users-batch.sh
```

或者手動建立每個使用者：

```bash
# 建立員工 1
supabase auth users create \
  --email zhang@ab360.com \
  --password zhang123 \
  --email-confirm true \
  --project-ref hhwkxjqjpnejozbytaow

# 建立員工 2
supabase auth users create \
  --email li@ab360.com \
  --password li123 \
  --email-confirm true \
  --project-ref hhwkxjqjpnejozbytaow

# ... 依此類推
```

---

## 方法 3：使用 Supabase Management API（進階）

如果你有 `service_role` key，可以使用 API：

```bash
# 設定環境變數
export SUPABASE_URL="https://hhwkxjqjpnejozbytaow.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# 建立使用者（使用 curl）
curl -X POST "${SUPABASE_URL}/auth/v1/admin/users" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "zhang@ab360.com",
    "password": "zhang123",
    "email_confirm": true
  }'
```

---

## 方法 4：使用 Python 腳本（自動化）

建立 `create_users.py`：

```python
import requests
import os

SUPABASE_URL = "https://hhwkxjqjpnejozbytaow.supabase.co"
SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

users = [
    {"email": "zhang@ab360.com", "password": "zhang123"},
    {"email": "li@ab360.com", "password": "li123"},
    {"email": "wang@ab360.com", "password": "wang123"},
    {"email": "chen@ab360.com", "password": "chen123"},
    {"email": "lin@ab360.com", "password": "lin123"},
    {"email": "huang@ab360.com", "password": "huang123"},
    {"email": "wu@ab360.com", "password": "wu123"},
    {"email": "zhou@ab360.com", "password": "zhou123"},
    {"email": "manager@ab360.com", "password": "manager123"},
]

headers = {
    "apikey": SERVICE_ROLE_KEY,
    "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
    "Content-Type": "application/json",
}

for user in users:
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        headers=headers,
        json={
            "email": user["email"],
            "password": user["password"],
            "email_confirm": True,
        },
    )
    if response.status_code == 200:
        print(f"✅ 建立成功: {user['email']}")
    else:
        print(f"❌ 建立失敗: {user['email']} - {response.text}")
```

執行：
```bash
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"
python create_users.py
```

---

## 推薦流程

### 最簡單的方式（推薦）

1. **使用 Dashboard UI**：手動建立 9 個帳號（約 5-10 分鐘）
2. **執行 SQL 腳本**：執行 `quick-setup.sql` 建立所有測試資料

### 最快的方式（需要 CLI）

1. **安裝 Supabase CLI**
2. **執行批量腳本**：`bash supabase/create-users-batch.sh`
3. **執行 SQL 腳本**：執行 `quick-setup.sql`

---

## 驗證使用者是否建立成功

在 Supabase Dashboard → Authentication → Users 中，應該看到：

- admin@example.com（已存在）
- goodmask77@gmail.com（已存在）
- zhang@ab360.com
- li@ab360.com
- wang@ab360.com
- chen@ab360.com
- lin@ab360.com
- huang@ab360.com
- wu@ab360.com
- zhou@ab360.com
- manager@ab360.com

**總共 11 個使用者**

---

## 建立完成後

執行 `supabase/quick-setup.sql` 建立所有員工資料和測試資料。

