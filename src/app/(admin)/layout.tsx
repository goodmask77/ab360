import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const navLinks = [
  { href: "/admin", label: "總覽" },
  { href: "/admin/accounts", label: "帳號" },
  { href: "/admin/cycles", label: "評鑑批次" },
  { href: "/admin/roles", label: "權限" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="flex flex-col gap-4 border-b border-slate-200 px-6 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-medium uppercase tracking-wide text-slate-500">
            AB360 Admin
          </span>
          <span className="text-xl font-semibold">管理後台</span>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-transparent px-3 py-1.5 text-slate-500 transition hover:border-slate-200 hover:text-slate-900 dark:hover:border-slate-700 dark:hover:text-slate-100"
            >
              {link.label}
            </Link>
          ))}
        </div>
        <Button size="sm" variant="outline" className="self-start sm:self-center">
          切換至夥伴端
        </Button>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
