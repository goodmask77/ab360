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
  const { employee, loading } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionCard[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!loading && employee) {
      loadSessions();
    } else if (!loading && !employee) {
      router.push("/login");
    }
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

      if (sessionsError) throw sessionsError;

      // 為每個場次查詢 assignments
      const sessionCards: SessionCard[] = [];
      for (const session of openSessions || []) {
        // 查詢自評 assignment
        const { data: selfAssignment } = await supabase
          .from("evaluation_assignments")
          .select("status")
          .eq("session_id", session.id)
          .eq("evaluator_id", employee.id)
          .eq("target_id", employee.id)
          .eq("is_self", true)
          .single();

        // 查詢同儕評 assignments
        const { data: peerAssignments } = await supabase
          .from("evaluation_assignments")
          .select("status")
          .eq("session_id", session.id)
          .eq("evaluator_id", employee.id)
          .eq("is_self", false);

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
      console.error("載入場次失敗:", error);
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
        <MobileLayout>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">無法載入員工資料</div>
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

            {/* 快速連結 */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                href="/tasks"
                className="bg-white rounded-lg shadow-sm p-4 text-center border border-gray-200 hover:border-blue-300 hover:shadow transition-all"
              >
                <div className="text-sm text-gray-500 mb-1">我的任務</div>
                <div className="text-lg font-semibold text-gray-900">查看任務</div>
              </Link>
              <Link
                href="/feedback"
                className="bg-white rounded-lg shadow-sm p-4 text-center border border-gray-200 hover:border-blue-300 hover:shadow transition-all"
              >
                <div className="text-sm text-gray-500 mb-1">我的回饋</div>
                <div className="text-lg font-semibold text-gray-900">查看回饋</div>
              </Link>
            </div>
          </div>
        </MobileLayout>
      )}
    </AuthGuard>
  );
}

