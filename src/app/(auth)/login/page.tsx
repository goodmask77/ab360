import Link from "next/link";
import { ArrowLeft, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function LoginPage() {
  return (
    <div className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-6 px-6 py-12">
      <Button asChild variant="ghost" className="w-max -ml-3">
        <Link href="/">
          <ArrowLeft className="h-4 w-4" />
          返回首頁
        </Link>
      </Button>

      <Card className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">輸入登入 ID</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            管理員在後台建立的登入 ID 可直接登入系統。
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="loginId" className="text-sm font-medium">
              登入 ID
            </label>
            <div className="flex items-center rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800">
              <User className="mr-2 h-4 w-4 text-slate-400" />
              <input
                id="loginId"
                type="text"
                placeholder="例如 LW888"
                className="w-full bg-transparent text-sm uppercase outline-none"
              />
            </div>
            <p className="text-xs text-slate-500">
              若忘記 ID，請向門店或區域管理員確認。
            </p>
          </div>

          <Button className="w-full" type="submit">
            立即登入
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          預設管理員登入 ID：<span className="font-semibold">LW888</span>
        </p>
      </Card>
    </div>
  );
}
