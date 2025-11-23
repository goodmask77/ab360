import { CalendarPlus, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminCyclesPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">評鑑批次設定</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          建立新批次、選取評分項目與權重，以及控制互評與積分交換規則。
        </p>
      </header>

      <Card className="space-y-3 p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <CalendarPlus className="h-4 w-4 text-slate-500" />
          建立批次
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          指定開始／結束日期、允許的評鑑角色與自評／互評比例。儲存後自動通知相關夥伴。
        </p>
      </Card>

      <Card className="space-y-3 p-6">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Settings2 className="h-4 w-4 text-slate-500" />
          評分項目庫
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          透過管理介面新增、停用或匯入項目，並指定適用的職級組合與權重設定。
        </p>
      </Card>
    </div>
  );
}
