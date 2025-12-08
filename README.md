# ab360

餐飲業 360 度評鑑系統（ab360），用於員工績效評估與成長追蹤。未來將整合薪資制度與夥伴成長系統。

## 技術棧

- **框架**: Next.js 14 (App Router)
- **語言**: TypeScript
- **樣式**: Tailwind CSS
- **資料庫**: Supabase (PostgreSQL)
- **認證**: Supabase Auth

## 專案結構

```
.
├── app/                    # Next.js App Router 頁面
│   ├── (auth)/            # 認證相關頁面
│   │   └── login/         # 登入頁
│   ├── (employee)/        # 員工相關頁面
│   │   └── dashboard/     # 員工儀表板
│   ├── (admin)/           # 管理員相關頁面
│   │   └── admin/
│   │       └── dashboard/ # 管理後台
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首頁
│   └── globals.css        # 全域樣式
├── lib/                   # 工具函數
│   └── supabaseClient.ts  # Supabase 客戶端設定
├── supabase/              # 資料庫相關
│   └── schema.sql         # 資料庫 Schema
└── public/                # 靜態資源

```

## 環境變數設定

請在專案根目錄建立 `.env.local` 檔案，並設定以下環境變數：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 取得 Supabase 環境變數

1. 前往 [Supabase Dashboard](https://app.supabase.com/)
2. 選擇你的專案
3. 進入 **Settings** > **API**
4. 複製以下資訊：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## 本機開發步驟

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變數

建立 `.env.local` 並填入 Supabase 相關資訊（見上方「環境變數設定」）。

### 3. 初始化資料庫

1. 前往 Supabase Dashboard 的 **SQL Editor**
2. 開啟 `supabase/schema.sql` 檔案
3. 將內容複製到 SQL Editor
4. 執行 SQL 腳本以建立所有資料表

### 4. 啟動開發伺服器

```bash
npm run dev
```

開啟瀏覽器前往 [http://localhost:3000](http://localhost:3000)

## 資料庫 Schema 說明

### 主要資料表

1. **employees** - 員工主檔
   - 對應 Supabase Auth 使用者
   - 記錄員工基本資料、角色、部門

2. **evaluation_sessions** - 評鑑場次
   - 例如：「2025/04 月度 360」
   - 管理場次的開始/結束時間與狀態

3. **evaluation_records** - 評鑑記錄
   - 記錄「誰評誰」的關係
   - 支援自評、同儕評、主管評
   - 可設定是否對被評者具名

4. **evaluation_scores** - 評分維度
   - 記錄各維度（如：出勤、態度、團隊合作）的分數（1-5 分）

5. **evaluation_comments** - 文字回饋
   - 正向回饋與建議改善

6. **ai_feedback** - AI 統整建議
   - 系統生成的總結與建議
   - 管理者可審核與修改

詳細 Schema 定義請參考 `supabase/schema.sql`。

## 目前功能狀態

### ✅ 已完成

- [x] Next.js + TypeScript + Tailwind 專案架構
- [x] Supabase Client 設定
- [x] 資料庫 Schema 設計
- [x] 基本頁面結構（登入、員工儀表板、管理後台）
- [x] 簡易 UI 布局

### 🚧 待實作

- [ ] Supabase Auth 整合
- [ ] 員工認證與權限控制
- [ ] 評鑑表單填寫功能
- [ ] 管理後台完整功能
- [ ] AI 回饋生成功能
- [ ] 資料視覺化與報表

## 開發指令

```bash
# 開發模式
npm run dev

# 建置生產版本
npm run build

# 啟動生產伺服器
npm start

# 執行 Lint
npm run lint
```

## 注意事項

- 目前登入功能為 placeholder，尚未實作真正的 Supabase Auth
- 各頁面的資料目前為假資料，之後會串接 Supabase 查詢
- 建議在開發前先完成資料庫 Schema 的初始化

## 授權

本專案為內部使用。

