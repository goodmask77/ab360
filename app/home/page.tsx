"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";

interface SessionCard {
  id: string;
  name: string;
  start_at: string | null;
  end_at: string | null;
  self_completed: boolean;
  peer_completed: number;
  peer_total: number;
}

export default function HomePage() {
  const { employee, loading, isAdmin } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionCard[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (loading) return;
    
    // 如果有員工資料，載入場次
    if (employee) {
      loadSessions();
    } else {
      // 如果沒有員工資料，停止載入狀態
      setLoadingSessions(false);
    }
    // 注意：即使沒有員工資料，也不重定向，讓 AuthGuard 處理
    // 避免與 login 頁面的重定向形成循環
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, loading]);

  const loadSessions = async () => {
    if (!employee) return;

    try {
      const supabase = createBrowserSupabaseClient();

      // 查詢進行中的場次
      const { data: openSessions, error: sessionsError } = await supabase
        .from("evaluation_sessions")
        .select("id, name, start_at, end_at")
        .eq("status", "open")
        .order("created_at", { ascending: false });

      if (sessionsError) {
        console.error("[API ERROR] load evaluation sessions:", sessionsError);
        throw sessionsError;
      }

      // 為每個場次查詢 assignments
      const sessionCards: SessionCard[] = [];
      for (const session of openSessions || []) {
        // 查詢自評 assignment
        const { data: selfAssignment, error: selfError } = await supabase
          .from("evaluation_assignments")
          .select("status")
          .eq("session_id", session.id)
          .eq("evaluator_id", employee.id)
          .eq("target_id", employee.id)
          .eq("is_self", true)
          .maybeSingle();

        if (selfError && selfError.code !== "PGRST116") {
          console.error("[API ERROR] get self assignment:", selfError);
        }

        // 查詢同儕評 assignments
        const { data: peerAssignments, error: peerError } = await supabase
          .from("evaluation_assignments")
          .select("status")
          .eq("session_id", session.id)
          .eq("evaluator_id", employee.id)
          .eq("is_self", false);

        if (peerError) {
          console.error("[API ERROR] get peer assignments:", peerError);
        }

        const peerCompleted = peerAssignments?.filter((a) => a.status === "completed").length || 0;
        const peerTotal = peerAssignments?.length || 0;

        sessionCards.push({
          id: session.id,
          name: session.name,
          start_at: session.start_at,
          end_at: session.end_at,
          self_completed: selfAssignment?.status === "completed",
          peer_completed: peerCompleted,
          peer_total: peerTotal,
        });
      }

      setSessions(sessionCards);
    } catch (error) {
      console.error("[API ERROR] load sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <AuthGuard requireAuth={true}>
      {loading || loadingSessions ? (
        <MobileLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        </MobileLayout>
      ) : !employee ? (
        <MobileLayout title="無法載入員工資料" showHomeButton={false}>
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-red-600 font-semibold text-lg">無法載入員工資料</div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md">
              <p className="text-sm text-gray-700 mb-2">
                <strong>可能的原因：</strong>
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 mb-4">
                <li>您的帳號尚未建立員工資料</li>
                <li>請訪問 <code className="bg-gray-100 px-1 rounded">/admin/setup-accounts</code> 來設定帳號權限</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-yellow-200">
                <p className="text-xs text-gray-600">
                  如果您是 <code className="bg-gray-100 px-1 rounded">gooodmask77@gmail.com</code>，請先使用該功能設定帳號權限。
                </p>
              </div>
            </div>
            <Link
              href="/admin/setup-accounts"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              前往設定帳號權限
            </Link>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title="首頁">

          <div className="space-y-6">
            {/* 使用者資訊 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="text-sm text-gray-500">歡迎回來</div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {employee.name}
              </div>
              {employee.department && (
                <div className="text-sm text-gray-600 mt-1">
                  {employee.department === "front"
                    ? "外場"
                    : employee.department === "back"
                    ? "內場"
                    : employee.department}
                </div>
              )}
            </div>

            {/* 評鑑場次列表 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">進行中的評鑑</h2>
              {sessions.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-500">目前沒有進行中的評鑑</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{session.name}</h3>
                          {(session.start_at || session.end_at) && (
                            <p className="text-sm text-gray-500 mt-1">
                              {formatDate(session.start_at)} ~ {formatDate(session.end_at)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        {/* 自評狀態 */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">自評</span>
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              session.self_completed
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {session.self_completed ? "已完成" : "待處理"}
                          </span>
                        </div>

                        {/* 互評進度 */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">互評</span>
                          <span className="text-gray-900 font-medium">
                            已完成 {session.peer_completed} / {session.peer_total}
                          </span>
                        </div>
                      </div>

                      {/* 開始評鑑按鈕 */}
                      <Link
                        href="/tasks"
                        className="block w-full bg-blue-600 text-white text-center py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        開始評鑑
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 管理員專屬區塊 */}
            {employee?.role === "owner" && (
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border-2 border-orange-300">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>⚙️</span>
                  <span>管理後台</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/admin"
                    className="bg-white rounded-lg p-3 text-center border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all"
                  >
                    <div className="text-xl mb-1">🏢</div>
                    <div className="text-xs text-gray-600">管理後台</div>
                    <div className="text-sm font-semibold text-gray-900">進入管理</div>
                  </Link>
                  <Link
                    href="/admin/sessions/new"
                    className="bg-white rounded-lg p-3 text-center border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all"
                  >
                    <div className="text-xl mb-1">➕</div>
                    <div className="text-xs text-gray-600">建立場次</div>
                    <div className="text-sm font-semibold text-gray-900">新增評鑑</div>
                  </Link>
                </div>
              </div>
            )}

            {/* 快速連結 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {employee?.role === "owner" ? "一般功能" : "快速連結"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/tasks"
                  className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 text-center border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-sm text-gray-600 mb-1">我的任務</div>
                  <div className="text-base font-semibold text-gray-900">查看任務</div>
                </Link>
                <Link
                  href="/me"
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 text-center border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <div className="text-2xl mb-2">📊</div>
                  <div className="text-sm text-gray-600 mb-1">我的回饋</div>
                  <div className="text-base font-semibold text-gray-900">查看回饋</div>
                </Link>
                <Link
                  href="/rewards"
                  className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-4 text-center border-2 border-amber-200 hover:border-amber-400 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <div className="text-2xl mb-2">🪙</div>
                  <div className="text-sm text-gray-600 mb-1">我的積分</div>
                  <div className="text-base font-semibold text-gray-900">積分系統</div>
                </Link>
                <Link
                  href="/rewards/leaderboard"
                  className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 text-center border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all active:scale-[0.98]"
                >
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-sm text-gray-600 mb-1">排行榜</div>
                  <div className="text-base font-semibold text-gray-900">查看排名</div>
                </Link>
              </div>
            </div>
          </div>
        </MobileLayout>
      )}
    </AuthGuard>
  );
}

