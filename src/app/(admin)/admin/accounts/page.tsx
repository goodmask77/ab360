import { UploadCloud, UserPlus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminAccountsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">帳號與登入 ID</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          支援單筆新增、批次匯入登入 ID，快速授權夥伴登入。
        </p>
      </header>

      <Card className="space-y-3 p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <UploadCloud className="h-4 w-4 text-slate-500" />
          批次匯入
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          上傳 CSV 檔案後，系統會透過 Supabase Edge Function 建立帳號並同步登入 ID。
        </p>
        <div className="rounded-2xl border border-dashed border-slate-300 p-4 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
          CSV 欄位範例：login_id, name, email, role, grade, initial_credits
        </div>
      </Card>

      <Card className="space-y-4 p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <UserPlus className="h-4 w-4 text-slate-500" />
          單筆新增帳號
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          立即為新進夥伴建立帳號並同步寄送無密碼登入碼。
        </p>
        <form className="grid gap-3 text-sm sm:grid-cols-2">
          <label className="space-y-1">
            <span className="font-medium">登入 ID</span>
            <input
              type="text"
              placeholder="LW123"
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm uppercase outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium">姓名</span>
            <input
              type="text"
              placeholder="王小安"
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-1 sm:col-span-2">
            <span className="font-medium">電子郵件</span>
            <input
              type="email"
              placeholder="partner@ab360.team"
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium">角色</span>
            <select
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
              defaultValue="STAFF"
            >
              <option value="STAFF">一般夥伴</option>
              <option value="MANAGER">主管</option>
              <option value="ADMIN">管理員</option>
            </select>
          </label>
          <label className="space-y-1">
            <span className="font-medium">職級</span>
            <input
              type="text"
              placeholder="A1 / B2"
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label className="space-y-1">
            <span className="font-medium">初始積分</span>
            <input
              type="number"
              min={0}
              placeholder="200"
              className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-auto">
              建立帳號並立即開通
            </Button>
          </div>
        </form>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            預設管理員登入 ID：<span className="font-semibold">LW888</span>
          </p>
      </Card>
    </div>
  );
}
