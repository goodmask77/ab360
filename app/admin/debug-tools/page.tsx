"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";

export default function DebugToolsPage() {
  const { isAdmin, loading } = useSession();
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);

  const handleGenerateDemoData = async () => {
    if (!confirm("確定要生成 20 筆測試資料嗎？這會建立虛擬員工、評鑑場次、評分記錄和積分投票。")) {
      return;
    }

    setGenerating(true);
    setResult(null);

    try {
      const response = await fetch("/api/debug/create-demo-data", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失敗");
      }

      setResult({
        success: true,
        message: data.message || "已成功建立測試資料！",
        data: data.data,
      });

      // 3 秒後自動刷新頁面
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error: any) {
      setResult({
        success: false,
        message: error.message || "生成失敗",
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <MobileLayout title="測試工具">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">載入中...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!isAdmin) {
    return (
      <MobileLayout title="測試工具">
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
          <p className="text-gray-500">您沒有權限訪問此頁面</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <MobileLayout title="測試工具">
        <div className="space-y-6">
          {/* 說明 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📝 測試資料生成工具</h3>
            <p className="text-sm text-gray-600">
              此工具會自動建立：
            </p>
            <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
              <li>20 位虛擬員工</li>
              <li>1 個評鑑場次（含 10 道預設題目）</li>
              <li>20 筆評鑑記錄</li>
              <li>20-50 筆積分投票</li>
            </ul>
          </div>

          {/* 生成按鈕 */}
          <button
            onClick={handleGenerateDemoData}
            disabled={generating}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                <span>生成中...</span>
              </span>
            ) : (
              "⚡ 生成 20 筆測試資料"
            )}
          </button>

          {/* 結果顯示 */}
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
              {result.data && (
                <div className="mt-3 pt-3 border-t border-gray-300">
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>員工數：{result.data.employees_count}</div>
                    <div>場次：{result.data.session_name}</div>
                    <div>評鑑記錄：{result.data.records_count}</div>
                    <div>積分投票：{result.data.points_count}</div>
                  </div>
                </div>
              )}
              {result.success && (
                <p className="text-xs text-gray-500 mt-2">
                  頁面將在 3 秒後自動刷新...
                </p>
              )}
            </div>
          )}

          {/* 快速連結 */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-3">快速連結</h3>
            <div className="space-y-2">
              <button
                onClick={() => router.push("/admin")}
                className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                ← 返回管理後台
              </button>
              <button
                onClick={() => router.push("/rewards/leaderboard")}
                className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                查看排行榜
              </button>
              <button
                onClick={() => router.push("/tasks")}
                className="w-full text-left px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                查看任務列表
              </button>
            </div>
          </div>
        </div>
      </MobileLayout>
    </AuthGuard>
  );
}


