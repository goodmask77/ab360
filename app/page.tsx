"use client";

import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "@/components/Button";

export default function Home() {
  const { user, loading } = useSession();
  const router = useRouter();

  // 只在載入完成且已登入時才重定向，避免循環
  useEffect(() => {
    if (!loading && user) {
      router.replace("/home");
    }
  }, [user, loading, router]);

  // 載入中或已登入時顯示空白（避免閃爍）
  if (loading || user) {
    return (
      <div className="min-h-screen bg-dark-base flex items-center justify-center">
        <div className="text-text-secondary">載入中...</div>
      </div>
    );
  }

  // 未登入顯示歡迎頁
  return (
    <div className="min-h-screen bg-dark-base flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-text-primary mb-2">
            歡迎使用 360 評鑑系統
          </h1>
          <p className="text-text-secondary">ab360 餐飲業夥伴評鑑平台</p>
        </div>

        <div className="card p-8 space-y-4">
          <Link href="/login" className="block">
            <Button fullWidth variant="primary">
              登入系統
            </Button>
          </Link>
        </div>

        <div className="text-center text-sm text-text-secondary">
          <p>請使用您的帳號登入以開始使用</p>
        </div>
      </div>
    </div>
  );
}

