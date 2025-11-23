import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const highlights = [
  {
    title: "行動優先流程",
    description: "快速完成自評／互評，任何裝置皆可順暢操作。",
  },
  {
    title: "彈性積分機制",
    description: "依職級配置投票積分，透明掌握投票軌跡。",
  },
  {
    title: "AI 即時摘要",
    description: "自動整理好評、待改進與具體建議，第一時間送達受評者。",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-black">
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          AB360 評鑑平台
        </Link>
        <div className="flex gap-3">
          <Button asChild variant="ghost">
            <Link href="/admin">管理後台</Link>
          </Button>
          <Button asChild>
            <Link href="/login">夥伴登入</Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-10 px-6 pb-16 sm:px-10">
        <section className="flex flex-col gap-6 pt-6 sm:pt-12">
          <div className="max-w-xl space-y-4">
            <span className="inline-flex items-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-800 dark:text-slate-300">
              餐飲夥伴 360 評鑑
            </span>
            <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
              專為餐飲夥伴打造的行動化自評、互評與積分平台。
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              讓前場與內場夥伴都能快速完成評鑑、透明掌握貢獻度，並以 AI 即時回饋具體改善建議。
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/login">立即登入體驗</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin">管理員設定</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {highlights.map((item) => (
            <Card key={item.title} className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {item.description}
              </p>
            </Card>
          ))}
        </section>

        <section className="rounded-3xl border border-dashed border-slate-200 p-6 text-sm leading-6 text-slate-600 dark:border-slate-800 dark:text-slate-300">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            下一步
          </h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5">
            <li>建立 Supabase 專案並設置資料表與 RLS 規則。</li>
            <li>設定 Vercel 環境變數：`NEXT_PUBLIC_SUPABASE_URL` 與 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。</li>
            <li>開發登入流程與權限守護，再串接評鑑與積分流程。</li>
          </ol>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-6 py-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400 sm:px-10">
        Supabase + Vercel + AI Summaries · AB360 © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
