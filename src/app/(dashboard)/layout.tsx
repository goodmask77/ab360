import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
        <div className="flex flex-col">
          <span className="text-sm font-medium">AB360</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            餐飲夥伴儀表板
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-sm font-medium">
            總覽
          </Link>
          <Link href="/votes" className="text-sm text-slate-500 dark:text-slate-400">
            投票紀錄
          </Link>
          <Button size="sm" variant="outline">
            登出
          </Button>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
