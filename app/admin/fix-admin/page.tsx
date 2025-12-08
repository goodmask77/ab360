"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";

export default function FixAdminPage() {
  const router = useRouter();
  const [fixing, setFixing] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  const handleFix = async () => {
    setFixing(true);
    setResult(null);

    try {
      const response = await fetch("/api/debug/fix-admin-account", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "修復失敗");
      }

      setResult({
        success: true,
        message: data.message || "管理員帳號已修復！",
        data: data.data,
      });
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "修復失敗",
      });
    } finally {
      setFixing(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      <MobileLayout title="修復管理員帳號">
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">🔧 自動修復管理員帳號</h3>
            <p className="text-sm text-gray-700">
              此工具會自動：
            </p>
            <ul className="text-sm text-gray-700 mt-2 space-y-1 list-disc list-inside">
              <li>使用現有的 manager@ab360.com 或建立 admin@ab360.test</li>
              <li>更新密碼為 admin123 或 Admin123!</li>
              <li>將員工記錄設為 owner（擁有者）</li>
            </ul>
          </div>

          <button
            onClick={handleFix}
            disabled={fixing}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {fixing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>修復中...</span>
              </span>
            ) : (
              "🚀 立即修復管理員帳號"
            )}
          </button>

          {result && (
            <div
              className={`rounded-xl p-4 border-2 ${
                result.success
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div
                className={`font-semibold mb-2 ${
                  result.success ? "text-green-800" : "text-red-800"
                }`}
              >
                {result.success ? "✅ 成功" : "❌ 失敗"}
              </div>
              <p
                className={`text-sm ${
                  result.success ? "text-green-700" : "text-red-700"
                }`}
              >
                {result.message}
              </p>
              {result.success && result.data && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>
                      <strong>Email:</strong> {result.data.email}
                    </div>
                    <div>
                      <strong>Password:</strong> {result.data.password}
                    </div>
                    <div>
                      <strong>Role:</strong> {result.data.role}
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-2">
                      📝 現在可以使用以下資訊登入：
                    </p>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-gray-600">Email:</span>{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          {result.data.email}
                        </code>
                      </div>
                      <div>
                        <span className="text-gray-600">Password:</span>{" "}
                        <code className="bg-gray-100 px-2 py-1 rounded">
                          {result.data.password}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              返回管理後台
            </button>
            <button
              onClick={() => router.push("/login")}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              前往登入
            </button>
          </div>
        </div>
      </MobileLayout>
    </AuthGuard>
  );
}

