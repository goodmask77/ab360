"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth";
import { useSession } from "@/lib/hooks/useSession";
import MobileLayout from "@/components/MobileLayout";
import Card from "@/components/Card";
import Button from "@/components/Button";

export default function LoginPage() {
  const { user, loading: authLoading } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasRedirectedRef = useRef(false);

  // 如果已登入，導向首頁（使用 replace 避免歷史記錄堆疊）
  useEffect(() => {
    if (!authLoading && user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
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
        if (!hasRedirectedRef.current) {
          hasRedirectedRef.current = true;
          router.replace("/home");
        }
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
        <Card>
          <div className="p-6">
            <h2 className="text-2xl font-bold text-text-primary mb-6 text-center">登入</h2>

            {error && (
              <div className="mb-4 p-3 bg-dark-card border border-red-400/30 text-red-400 rounded-[12px] text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-text-primary mb-2"
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
                  className="input"
                />
              </div>

              <Button type="submit" disabled={loading} fullWidth>
                {loading ? "登入中..." : "登入"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}

