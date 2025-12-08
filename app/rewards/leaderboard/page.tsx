"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import {
  getLeaderboard,
  getCategoryLeaderboard,
  getRewardCategories,
  type LeaderboardEntry,
  type RewardCategory,
} from "@/lib/api/rewards";
import { getAllSessions } from "@/lib/api/sessions";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Badge from "@/components/Badge";
import Tabs from "@/components/Tabs";

type TabType = "total" | "category";

export default function LeaderboardPage() {
  const { employee, loading } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [categories, setCategories] = useState<RewardCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("total");
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && employee) {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, loading]);

  useEffect(() => {
    if (selectedSessionId) {
      loadLeaderboard();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId, selectedCategory, activeTab]);

  const loadInitialData = async () => {
    try {
      const [allSessions, allCategories] = await Promise.all([
        getAllSessions(),
        getRewardCategories(),
      ]);

      const openSessions = allSessions.filter((s) => s.status === "open" || s.status === "closed");
      setSessions(openSessions);
      setCategories(allCategories);

      if (openSessions.length > 0 && !selectedSessionId) {
        setSelectedSessionId(openSessions[0].id);
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
      let data: LeaderboardEntry[];
      if (activeTab === "category" && selectedCategory) {
        data = await getCategoryLeaderboard(selectedSessionId, selectedCategory);
      } else {
        data = await getLeaderboard(selectedSessionId);
      }
      setLeaderboard(data);
    } catch (error) {
      console.error("[API ERROR] load leaderboard:", error);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return "🥇";
    if (rank === 2) return "🥈";
    if (rank === 3) return "🥉";
    return null;
  };

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return employee && entry.employee_id === employee.id;
  };

  if (loading || loadingData) {
    return (
      <MobileLayout title="排行榜">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">載入中...</div>
        </div>
      </MobileLayout>
    );
  }

  if (sessions.length === 0) {
    return (
      <MobileLayout title="排行榜">
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
          <p className="text-gray-500">目前沒有可查看的排行榜</p>
        </div>
      </MobileLayout>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <MobileLayout title="排行榜" showBackButton={true} onBack={() => router.push("/rewards")}>
        <div className="space-y-6">
          {/* 場次選擇 */}
          {sessions.length > 1 && (
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
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tab 切換 */}
          <Tabs
            tabs={[
              { id: "total", label: "總排行" },
              { id: "category", label: "類別王" },
            ]}
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab as TabType);
              if (tab === "category" && categories.length > 0 && !selectedCategory) {
                setSelectedCategory(categories[0].key);
              }
            }}
          />

          {/* 類別選擇（僅在類別王 Tab 顯示） */}
          {activeTab === "category" && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選擇類別
              </label>
              <select
                value={selectedCategory || ""}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 排行榜列表 */}
          {leaderboard.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
              <p className="text-gray-500">目前還沒有積分記錄</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => {
                const rank = index + 1;
                const isUser = isCurrentUser(entry);
                const rankIcon = getRankIcon(rank);

                return (
                  <div
                    key={entry.employee_id}
                    className={`rounded-xl p-4 border-2 transition-all ${
                      isUser
                        ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-400 shadow-lg"
                        : rank <= 3
                        ? "bg-amber-50 border-amber-300"
                        : "bg-white border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {/* 排名 */}
                        <div className="flex-shrink-0 w-12 text-center">
                          {rankIcon ? (
                            <div className="text-2xl">{rankIcon}</div>
                          ) : (
                            <div
                              className={`text-lg font-bold ${
                                rank <= 3 ? "text-amber-600" : "text-gray-400"
                              }`}
                            >
                              #{rank}
                            </div>
                          )}
                        </div>

                        {/* 員工資訊 */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <div className="font-semibold text-gray-900 text-lg">
                              {entry.employee_name}
                            </div>
                            {isUser && (
                              <Badge variant="success" size="sm">
                                我
                              </Badge>
                            )}
                            {rank <= 3 && (
                              <span className="text-xl">👑</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
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
                          </div>
                        </div>

                        {/* 積分 */}
                        <div className="flex-shrink-0 text-right">
                          <div className="text-2xl font-bold text-emerald-600">
                            {entry.total_points}
                          </div>
                          <div className="text-xs text-gray-500">點</div>
                        </div>
                      </div>
                    </div>

                    {/* 類別細分（僅在總排行顯示） */}
                    {activeTab === "total" && Object.keys(entry.category_points).length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(entry.category_points)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 3)
                            .map(([catKey, points]) => {
                              const cat = categories.find((c) => c.key === catKey);
                              return (
                                <Badge key={catKey} variant="default" size="sm">
                                  {cat?.name || catKey}: {points} 點
                                </Badge>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 我的排名提示（如果不在前 10 名） */}
          {employee && activeTab === "total" && leaderboard.length > 0 && (
            (() => {
              const myIndex = leaderboard.findIndex((e) => e.employee_id === employee.id);
              if (myIndex >= 10) {
                const myRank = myIndex + 1;
                const myEntry = leaderboard[myIndex];
                const prevEntry = leaderboard[myIndex - 1];
                const pointsDiff = prevEntry ? prevEntry.total_points - myEntry.total_points : 0;

                return (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="text-sm text-gray-700 mb-1">
                      你的排名：#{myRank}
                    </div>
                    {pointsDiff > 0 && (
                      <div className="text-xs text-gray-600">
                        距離前一名還差 {pointsDiff} 點
                      </div>
                    )}
                  </div>
                );
              }
              return null;
            })()
          )}
        </div>
      </MobileLayout>
    </AuthGuard>
  );
}

