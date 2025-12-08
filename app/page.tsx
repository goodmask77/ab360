import { redirect } from "next/navigation";
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

export default async function Home() {
  // 檢查是否已登入
  const supabase = createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 已登入則導向 /home
  if (session) {
    redirect("/home");
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

