import { ClipboardList, Upload, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";

const actions = [
  {
    title: "批次匯入夥伴帳號",
    description: "支援 CSV 匯入並寄送登入碼。",
    href: "/admin/accounts",
    icon: Upload,
  },
  {
    title: "設定評鑑批次",
    description: "定義評分項目、時程與積分配置。",
    href: "/admin/cycles",
    icon: ClipboardList,
  },
  {
    title: "管理權限與職級",
    description: "依職級設定可見範圍與權限。",
    href: "/admin/roles",
    icon: Users,
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="flex min-h-svh flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold">管理後台</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          統一設定帳號、評鑑批次、積分與權限，並追蹤最新進度。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {actions.map(({ title, description, href, icon: Icon }) => (
          <Card key={title} className="space-y-3 p-5">
            <Icon className="h-5 w-5 text-slate-500" />
            <div className="space-y-1">
              <Link href={href} className="text-base font-semibold">
                {title}
              </Link>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          </Card>
        ))}
      </section>
    </div>
  );
}
