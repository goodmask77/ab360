import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
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
          <h1 className="text-2xl font-semibold">登入 AB360</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            管理員會寄發無密碼登入碼，輸入後即可快速登入。
          </p>
        </div>

        <form className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              電子郵件
            </label>
            <div className="flex items-center rounded-2xl border border-slate-200 px-3 py-2 dark:border-slate-800">
              <Mail className="mr-2 h-4 w-4 text-slate-400" />
              <input
                id="email"
                type="email"
                placeholder="yourname@ab360.team"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
            <p className="text-xs text-slate-500">
              提交後我們會寄送一次性登入碼至上述信箱。
            </p>
          </div>

          <Button className="w-full" type="submit">
            傳送登入碼
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          沒收到登入碼？請向門店或區域管理員確認帳號是否已啟用。
        </p>
      </Card>
    </div>
  );
}
