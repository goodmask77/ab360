"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import {
  getUserRemainingQuota,
  getUserGivenPoints,
  getUserReceivedPoints,
  getLeaderboard,
} from "@/lib/api/rewards";
import { getAllSessions } from "@/lib/api/sessions";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Badge from "@/components/Badge";

export default function RewardsPage() {
  const { employee, loading } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [remainingQuota, setRemainingQuota] = useState<number>(0);
  const [givenPoints, setGivenPoints] = useState<any[]>([]);
  const [receivedPoints, setReceivedPoints] = useState<{ total: number; byCategory: Record<string, number> }>({
    total: 0,
    byCategory: {},
  });
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && employee) {
      loadSessions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, loading]);

  useEffect(() => {
    if (selectedSessionId && employee) {
      loadRewardsData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId, employee]);

  const loadSessions = async () => {
    try {
      const allSessions = await getAllSessions();
      const openSessions = allSessions.filter((s) => s.status === "open");
      setSessions(openSessions);
      if (openSessions.length > 0 && !selectedSessionId) {
        setSelectedSessionId(openSessions[0].id);
      }
    } catch (error) {
      console.error("[API ERROR] load sessions:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadRewardsData = async () => {
    if (!employee || !selectedSessionId) return;

    try {
      const [quota, given, received, leaderboard] = await Promise.all([
        getUserRemainingQuota(selectedSessionId, employee.id),
        getUserGivenPoints(selectedSessionId, employee.id),
        getUserReceivedPoints(selectedSessionId, employee.id),
        getLeaderboard(selectedSessionId),
      ]);

      setRemainingQuota(quota);
      setGivenPoints(given);
      setReceivedPoints(received);

      // 計算我的排名
      const rank = leaderboard.findIndex((e) => e.employee_id === employee.id);
      setMyRank(rank >= 0 ? rank + 1 : null);
    } catch (error) {
      console.error("[API ERROR] load rewards data:", error);
    }
  };

  if (loading || loadingData) {
    return (
      <MobileLayout title="我的積分">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">載入中...</div>
        </div>
      </MobileLayout>
    );
  }

  if (sessions.length === 0) {
    return (
      <MobileLayout title="我的積分">
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
          <div className="text-4xl mb-3">🎁</div>
          <p className="text-gray-700 font-medium mb-1">目前沒有進行中的積分活動</p>
          <p className="text-sm text-gray-500">等待管理員開啟新的評鑑場次</p>
        </div>
      </MobileLayout>
    );
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId);

  return (
    <AuthGuard requireAuth={true}>
      <MobileLayout title="我的積分">
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

          {/* 剩餘點數卡片 */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border-2 border-emerald-200 text-center">
            <div className="text-5xl mb-3">🪙</div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              剩餘 {remainingQuota} 點
            </div>
            <p className="text-sm text-gray-600 mb-4">
              可以送給夥伴
            </p>
            <Link
              href="/rewards/give"
              className="block w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              ✨ 送出積分
            </Link>
          </div>

          {/* 我的排名 */}
          {myRank !== null && (
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">我的排名</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-emerald-600">
                    #{myRank}
                  </span>
                  {myRank <= 3 && (
                    <span className="text-2xl">👑</span>
                  )}
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-500">
                總積分：{receivedPoints.total} 點
              </div>
            </div>
          )}

          {/* 已送出的積分 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">我送出的積分</h2>
            {givenPoints.length === 0 ? (
              <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                <p className="text-gray-500 text-sm">還沒有送出任何積分</p>
              </div>
            ) : (
              <div className="space-y-2">
                {givenPoints.map((point) => (
                  <div
                    key={point.id}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {point.receiver_name}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {point.category_name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">
                          +{point.points}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(point.created_at).toLocaleDateString("zh-TW")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 我獲得的積分 */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">我獲得的積分</h2>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200 text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">
                {receivedPoints.total} 點
              </div>
              <p className="text-sm text-gray-600 mb-4">總積分</p>
              <Link
                href="/rewards/leaderboard"
                className="inline-block bg-amber-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-amber-600 transition-colors"
              >
                查看完整排行榜
              </Link>
            </div>
          </div>
        </div>
      </MobileLayout>
    </AuthGuard>
  );
}

