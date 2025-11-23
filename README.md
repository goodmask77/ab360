## AB360 餐飲夥伴評鑑平台

AB360 是一套行動優先的 360 度評鑑系統，提供餐飲業內外場夥伴「自評、互評、主管評」的整合體驗，並透過積分與 AI 摘要提升回饋效率。

### 技術棧
- Next.js 14 App Router + TypeScript + Tailwind CSS 4
- Supabase (Auth / PostgreSQL / Edge Functions / Storage)
- Vercel 部署與 CI
- OpenAI / Supabase AI：自動摘要評語

### 快速開始
1. 安裝套件：
	```bash
	npm install
	```
2. 設定環境變數，複製 `.env.example` 為 `.env.local`，填入：
	```bash
	NEXT_PUBLIC_SUPABASE_URL=your-project-url
	NEXT_PUBLIC_SUPABASE_ANON_KEY=public-anon-key
	SUPABASE_SERVICE_ROLE_KEY=service-role-key
	OPENAI_API_KEY=sk-...
	```
3. 啟動開發伺服器：
	```bash
	npm run dev
	```
4. 造訪 [http://localhost:3000](http://localhost:3000) 驗證登入、夥伴儀表板與管理後台導覽。

### 專案結構
- `src/app`：Next.js App Router。包含公共首頁、夥伴儀表板 `(dashboard)`、管理後台 `(admin)`、登入頁 `(auth)`。
- `src/components/ui`：共用 UI 元件（Button、Card）。
- `src/lib/supabase`：Supabase 瀏覽器與伺服器端客戶端、資料表型別定義。
- `src/lib/utils.ts`：Tailwind 類別合併工具。

### 下一步建議
1. 依照 `src/lib/supabase/types.ts` 建立資料表與 RLS 規則。
2. 實作無密碼登入流程（魔術連結或一次性登入碼）。
3. 完成評鑑批次、題庫、積分台帳 API 與 Edge Functions。
4. 建立 AI 摘要 Edge Function 串接 OpenAI，並在評語送出時觸發。

歡迎在 Vercel 上部署並整合 Supabase 專案，打造餐飲夥伴的公開協作評鑑平台。
