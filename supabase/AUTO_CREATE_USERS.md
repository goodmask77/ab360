# 🚀 自動建立虛擬帳號（最快速方法）

## 方法 1：使用 Node.js 腳本（推薦）

### 步驟 1：取得 service_role key

1. 前往 Supabase Dashboard
2. 點擊 **Settings** → **API**
3. 找到 **service_role** key（secret，不是 anon key）
4. **複製這個 key**（很重要！）

### 步驟 2：執行腳本

在終端機執行：

```bash
cd "/Users/wayz/Documents/cursor ab360"

# 設定 service_role key（替換 YOUR_SERVICE_ROLE_KEY）
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# 執行腳本
node supabase/create-users-api.js
```

### 步驟 3：完成！

腳本會自動建立所有 9 個帳號，並顯示建立結果。

---

## 方法 2：使用 Python 腳本

如果你有 Python 3：

```bash
cd "/Users/wayz/Documents/cursor ab360"

# 設定 service_role key
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"

# 執行腳本
python3 supabase/create-users-python.py
```

---

## 方法 3：一鍵執行（需要先設定 key）

建立一個快速執行腳本：

```bash
# 編輯腳本，填入你的 service_role key
nano supabase/run-create-users.sh
```

內容：
```bash
#!/bin/bash
export SUPABASE_SERVICE_ROLE_KEY="你的_service_role_key"
node supabase/create-users-api.js
```

然後執行：
```bash
chmod +x supabase/run-create-users.sh
./supabase/run-create-users.sh
```

---

## ⚠️ 重要提醒

1. **service_role key 是機密資訊**，不要分享或提交到 Git
2. 如果腳本執行失敗，檢查：
   - service_role key 是否正確
   - Supabase URL 是否正確
   - 網路連線是否正常

---

## 執行完成後

執行 `supabase/quick-setup.sql` 建立員工資料和測試資料。

