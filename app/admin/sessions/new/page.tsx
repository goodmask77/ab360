"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { createSession } from "@/lib/api/sessions";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";

export default function NewSessionPage() {
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    start_at: "",
    end_at: "",
    status: "draft" as "draft" | "open" | "closed",
    reward_pool_points: 1000,
    vote_quota_per_user: 100,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!formData.name.trim()) {
        throw new Error("請輸入場次名稱");
      }

      const session = await createSession({
        name: formData.name,
        start_at: formData.start_at || undefined,
        end_at: formData.end_at || undefined,
        status: formData.status,
        reward_pool_points: formData.reward_pool_points,
        vote_quota_per_user: formData.vote_quota_per_user,
      });

      // 建立成功，導向場次管理頁面
      router.push(`/admin/sessions/${session.id}`);
    } catch (err: any) {
      console.error("建立場次錯誤:", err);
      setError(err.message || "建立場次失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <MobileLayout title="建立新場次" showHomeButton={true}>
        {authLoading ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        ) : (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                <p className="font-semibold">錯誤</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  場次名稱 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="例如：2025/04 月度 360"
                  required
                  className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    開始日期
                  </label>
                  <input
                    type="date"
                    value={formData.start_at}
                    onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
                    className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    結束日期
                  </label>
                  <input
                    type="date"
                    value={formData.end_at}
                    onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
                    className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  狀態
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      status: e.target.value as "draft" | "open" | "closed",
                    })
                  }
                  className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="draft">草稿</option>
                  <option value="open">進行中</option>
                  <option value="closed">已結束</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    積分池總額
                  </label>
                  <input
                    type="number"
                    value={formData.reward_pool_points}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reward_pool_points: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    每人投票配額
                  </label>
                  <input
                    type="number"
                    value={formData.vote_quota_per_user}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vote_quota_per_user: parseInt(e.target.value) || 0,
                      })
                    }
                    min="0"
                    className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "建立中..." : "建立場次"}
                </button>
              </div>
            </form>
          </div>
        )}
      </MobileLayout>
    </AuthGuard>
  );
}

