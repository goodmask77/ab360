"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { useSession } from "@/lib/hooks/useSession";
import MobileLayout from "@/components/MobileLayout";

export default function LoginPage() {
  const { user, loading: authLoading } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 如果已登入，導向首頁（使用 replace 避免歷史記錄堆疊）
  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/home");
    }
  }, [user, authLoading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await signIn(email);
      
      if (result.error) {
        throw result.error;
      }

      if (result.user || result.session) {
        // 登入成功，等待 session 完全建立
        await new Promise((resolve) => setTimeout(resolve, 300));
        
        // 重導向到首頁
        router.replace("/home");
      }
    } catch (err: any) {
      console.error("登入錯誤:", err);
      setError(err.message || "登入失敗，請檢查 email 是否正確");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout>
      <div className="min-h-[60vh] flex flex-col justify-center">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">登入</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                電子郵件
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="請輸入您的 email"
                required
                className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>


            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-base"
            >
              {loading ? "登入中..." : "登入"}
            </button>
          </form>
        </div>
      </div>
    </MobileLayout>
  );
}

