"use client";

import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  // 未登入顯示歡迎頁
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            歡迎使用 360 評鑑系統
          </h1>
          <p className="text-gray-600">ab360 餐飲業夥伴評鑑平台</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-4">
          <Link
            href="/login"
            className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            登入系統
          </Link>
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>請使用您的帳號登入以開始使用</p>
        </div>
      </div>
    </div>
  );
}

