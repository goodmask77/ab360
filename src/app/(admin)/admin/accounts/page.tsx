import { UploadCloud } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminAccountsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">帳號與登入碼</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          支援單筆新增、批次匯入以及登入碼寄送狀態追蹤。
        </p>
      </header>

      <Card className="space-y-3 p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <UploadCloud className="h-4 w-4 text-slate-500" />
          批次匯入
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          上傳 CSV 檔案後，系統會透過 Supabase Edge Function 建立帳號並寄送一次性登入碼。
        </p>
        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          CSV 欄位範例：name, email, role, grade, initial_credits
        </div>
      </Card>
    </div>
  );
}
