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
  const [generatingFull, setGeneratingFull] = useState(false);
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

  const handleGenerateFullDemoData = async () => {
    if (!confirm("確定要生成完整虛擬數據嗎？這會建立：\n- 50 位員工（含老闆、經理）\n- 3 個評鑑場次（過去、現在、未來）\n- 完整的評鑑記錄和答案\n- 豐富的積分投票記錄\n- AI 回饋數據\n\n這可能需要較長時間，請耐心等待。")) {
      return;
    }

    setGeneratingFull(true);
    setResult(null);

    try {
      const response = await fetch("/api/debug/create-full-demo-data", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失敗");
      }

      setResult({
        success: true,
        message: data.message || "已成功建立完整虛擬數據！",
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
      setGeneratingFull(false);
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
        <div className="bg-white rounded-xl p-8 border border-gray-200 space-y-4">
          <div className="text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">需要管理員權限</h2>
            <p className="text-gray-600 mb-4">您目前沒有權限訪問此頁面</p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-900 mb-2">如何獲得權限？</h3>
            <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
              <li>確保您的帳號在 <code className="bg-yellow-100 px-1 rounded">employees</code> 表中有對應記錄</li>
              <li>將您的 <code className="bg-yellow-100 px-1 rounded">role</code> 欄位設為 <code className="bg-yellow-100 px-1 rounded">manager</code> 或 <code className="bg-yellow-100 px-1 rounded">owner</code></li>
              <li>重新登入系統</li>
            </ol>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/admin")}
              className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
            >
              返回管理後台
            </button>
            <button
              onClick={() => router.push("/home")}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              返回首頁
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <MobileLayout title="測試工具">
        <div className="space-y-6">
          {/* 完整數據生成 */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-5">
            <h3 className="font-bold text-gray-900 mb-2 text-lg">🎯 生成完整虛擬數據（推薦）</h3>
            <p className="text-sm text-gray-700 mb-3">
              生成豐富完整的測試數據，包含：
            </p>
            <ul className="text-sm text-gray-700 mb-4 space-y-1 list-disc list-inside">
              <li>50 位員工（含 1 位老闆、4 位經理、45 位員工）</li>
              <li>3 個評鑑場次（過去已結束、現在進行中、未來預告）</li>
              <li>完整的評鑑記錄、答案和文字回饋</li>
              <li>豐富的積分投票記錄（每位員工 5-10 筆）</li>
              <li>AI 回饋數據</li>
            </ul>
            <button
              onClick={handleGenerateFullDemoData}
              disabled={generatingFull || generating}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {generatingFull ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  <span>生成中，請稍候...</span>
                </span>
              ) : (
                "🚀 生成完整虛擬數據"
              )}
            </button>
          </div>

          {/* 快速測試數據 */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-2">⚡ 快速測試資料（20 筆）</h3>
            <p className="text-sm text-gray-600 mb-3">
              快速生成少量測試數據：
            </p>
            <ul className="text-sm text-gray-600 mb-4 space-y-1 list-disc list-inside">
              <li>20 位虛擬員工</li>
              <li>1 個評鑑場次（含 10 道預設題目）</li>
              <li>20 筆評鑑記錄</li>
              <li>20-50 筆積分投票</li>
            </ul>
            <button
              onClick={handleGenerateDemoData}
              disabled={generating || generatingFull}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>

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
                    {result.data.sessions_count ? (
                      <>
                        <div>場次數：{result.data.sessions_count}</div>
                        <div className="mt-2">
                          <div className="font-semibold">場次列表：</div>
                          {result.data.sessions?.map((s: any) => (
                            <div key={s.id} className="ml-2">
                              • {s.name} ({s.status})
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div>場次：{result.data.session_name || result.data.session_id}</div>
                    )}
                    <div>評鑑記錄：{result.data.records_count}</div>
                    <div>積分投票：{result.data.points_count}</div>
                    {result.data.assignments_count && (
                      <div>評鑑任務：{result.data.assignments_count}</div>
                    )}
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


