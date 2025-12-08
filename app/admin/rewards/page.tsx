"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { getLeaderboard, getRewardCategories } from "@/lib/api/rewards";
import { getAllSessions } from "@/lib/api/sessions";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Badge from "@/components/Badge";
import type { LeaderboardEntry } from "@/lib/api/rewards";

export default function AdminRewardsPage() {
  const { isAdmin, loading } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/home");
    } else if (!loading && isAdmin) {
      loadInitialData();
    }
  }, [isAdmin, loading, router]);

  useEffect(() => {
    if (selectedSessionId) {
      loadLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId]);

  const loadInitialData = async () => {
    try {
      const [allSessions, allCategories] = await Promise.all([
        getAllSessions(),
        getRewardCategories(),
      ]);

      setSessions(allSessions);
      setCategories(allCategories);

      if (allSessions.length > 0 && !selectedSessionId) {
        setSelectedSessionId(allSessions[0].id);
      }
    } catch (error) {
      console.error("[API ERROR] load initial data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadLeaderboard = async () => {
    if (!selectedSessionId) return;

    try {
      const data = await getLeaderboard(selectedSessionId);
      setLeaderboard(data);
    } catch (error) {
      console.error("[API ERROR] load leaderboard:", error);
    }
  };

  if (loading || loadingData) {
    return (
      <MobileLayout title="積分管理">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">載入中...</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <MobileLayout title="積分管理" showBackButton={true} onBack={() => router.push("/admin")}>
        <div className="space-y-6">
          {/* 場次選擇 */}
          {sessions.length > 0 && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選擇場次
              </label>
              <select
                value={selectedSessionId || ""}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.status === "open" ? "進行中" : s.status === "closed" ? "已結束" : "草稿"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 統計摘要 */}
          {leaderboard.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {leaderboard.length}
                  </div>
                  <div className="text-xs text-gray-600">參與人數</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {leaderboard.reduce((sum, e) => sum + e.total_points, 0)}
                  </div>
                  <div className="text-xs text-gray-600">總積分</div>
                </div>
              </div>
            </div>
          )}

          {/* 積分明細表 */}
          {leaderboard.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <p className="text-gray-500">目前還沒有積分記錄</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        排名
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        姓名
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        部門
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        總積分
                      </th>
                      {categories.map((cat) => (
                        <th
                          key={cat.key}
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                        >
                          {cat.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {leaderboard.map((entry, index) => (
                      <tr key={entry.employee_id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {entry.employee_name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          <Badge
                            variant={
                              entry.department === "front"
                                ? "info"
                                : entry.department === "back"
                                ? "primary"
                                : "default"
                            }
                            size="sm"
                          >
                            {entry.department === "front"
                              ? "外場"
                              : entry.department === "back"
                              ? "內場"
                              : entry.department}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-emerald-600">
                          {entry.total_points}
                        </td>
                        {categories.map((cat) => (
                          <td key={cat.key} className="px-4 py-3 text-sm text-gray-600">
                            {entry.category_points[cat.key] || 0}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </MobileLayout>
    </AuthGuard>
  );
}


