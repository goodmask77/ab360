import { LockKeyhole, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminRolesPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">權限與職級</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          將夥伴分配至職級並定義可見範圍與積分上限。
        </p>
      </header>

      <Card className="space-y-3 p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <LockKeyhole className="h-4 w-4 text-slate-500" />
          權限層級
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          透過 Supabase RLS 保證資料隔離，管理員可透過此頁面設定各層級對應的 Row Level Policy 規則與可讀欄位。
        </p>
      </Card>

      <Card className="space-y-3 p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <ShieldCheck className="h-4 w-4 text-slate-500" />
          積分配置
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          管理員可按職級一次調整各成員的可用積分並紀錄調整原因，以利審計追蹤。
        </p>
      </Card>
    </div>
  );
}
