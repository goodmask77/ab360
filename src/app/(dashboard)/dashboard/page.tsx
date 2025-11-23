import { CalendarCheck, Coins, MessagesSquare } from "lucide-react";
import { Card } from "@/components/ui/card";

const tasks = [
  {
    title: "完成自評",
    description: "秋季評鑑開放中，請於 11/30 前完成自評表單。",
  },
  {
    title: "互評待辦 3 則",
    description: "尚有 3 位夥伴待互評，平均積分消耗 20 點。",
  },
];

const insights = [
  {
    icon: CalendarCheck,
    label: "本期進度",
    value: "60%",
    hint: "自評已完成，互評尚缺 2 位",
  },
  {
    icon: Coins,
    label: "剩餘積分",
    value: "120",
    hint: "12/01 將重置為 200 點",
  },
  {
    icon: MessagesSquare,
    label: "收到回饋",
    value: "5",
    hint: "最新 AI 摘要已更新",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-svh flex-col gap-6 px-6 py-12">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold">夥伴總覽</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          查看目前評鑑進度、積分餘額與最新回饋摘要。
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        {insights.map(({ icon: Icon, label, value, hint }) => (
          <Card key={label} className="space-y-2">
            <Icon className="h-5 w-5 text-slate-500" />
            <div className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {label}
            </div>
            <div className="text-2xl font-semibold">{value}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">待辦事項</h2>
        <div className="grid gap-3">
          {tasks.map((task) => (
            <Card key={task.title} className="space-y-1">
              <div className="text-sm font-medium">{task.title}</div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {task.description}
              </p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
