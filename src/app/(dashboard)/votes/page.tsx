import { Coins } from "lucide-react";
import { Card } from "@/components/ui/card";

const votes = [
  {
    colleague: "王小安",
    points: 30,
    note: "支援晚班客訴處理與備貨整備",
    timestamp: "2025-11-18 21:40",
  },
  {
    colleague: "李冠霖",
    points: 20,
    note: "協助補貨並主動指導新進夥伴",
    timestamp: "2025-11-16 17:25",
  },
];

export default function VotesPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-12">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">積分投票紀錄</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          查看近期給予夥伴的積分與投票說明。
        </p>
      </header>

      <Card className="flex items-center justify-between p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Coins className="h-4 w-4 text-amber-500" />
          本期剩餘積分
        </div>
        <span className="text-lg font-semibold">120</span>
      </Card>

      <div className="space-y-3">
        {votes.map((vote) => (
          <Card key={vote.timestamp} className="space-y-2">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>{vote.colleague}</span>
              <span className="text-amber-600">+{vote.points} 點</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {vote.note}
            </p>
            <div className="text-[11px] text-slate-400">{vote.timestamp}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
