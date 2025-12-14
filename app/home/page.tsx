"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";

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
            <div className="text-text-secondary">載入中...</div>
          </div>
        </MobileLayout>
      ) : !employee ? (
        <MobileLayout title="無法載入員工資料" showHomeButton={false}>
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-red-400 font-semibold text-lg">無法載入員工資料</div>
            <Card>
              <div className="p-4 max-w-md">
                <p className="text-sm text-text-primary mb-2">
                  <strong>可能的原因：</strong>
                </p>
                <ul className="list-disc list-inside text-sm text-text-secondary space-y-1 mb-4">
                  <li>您的帳號尚未建立員工資料</li>
                  <li>請訪問 <code className="bg-dark-surface px-1 rounded text-gold">/admin/setup-accounts</code> 來設定帳號權限</li>
                </ul>
                <div className="mt-4 pt-4 border-t border-dark-border">
                  <p className="text-xs text-text-secondary">
                    如果您是 <code className="bg-dark-surface px-1 rounded text-gold">gooodmask77@gmail.com</code>，請先使用該功能設定帳號權限。
                  </p>
                </div>
              </div>
            </Card>
            <Link href="/admin/setup-accounts">
              <Button variant="primary">前往設定帳號權限</Button>
            </Link>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title="首頁">

          <div className="space-y-6">
            {/* 評鑑場次列表 */}
            <div>
              <h2 className="section-title">進行中的評鑑</h2>
              {sessions.length === 0 ? (
                <Card>
                  <div className="p-6 text-center">
                    <p className="text-text-secondary">目前沒有進行中的評鑑</p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <Card key={session.id}>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary">{session.name}</h3>
                            {(session.start_at || session.end_at) && (
                              <p className="text-sm text-text-secondary mt-1">
                                {formatDate(session.start_at)} ~ {formatDate(session.end_at)}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {/* 自評狀態 */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">自評</span>
                            <StatusBadge status={session.self_completed ? "success" : "warning"}>
                              {session.self_completed ? "已完成" : "待處理"}
                            </StatusBadge>
                          </div>

                          {/* 互評進度 */}
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-text-secondary">互評</span>
                            <span className="text-text-primary font-medium">
                              已完成 {session.peer_completed} / {session.peer_total}
                            </span>
                          </div>
                        </div>

                        {/* 開始評鑑按鈕 */}
                        <Link href={`/evaluate/${session.id}`} className="block">
                          <Button fullWidth variant="primary">
                            開始評鑑
                          </Button>
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* 管理員專屬區塊 */}
            {employee?.role === "owner" && (
              <Card>
                <div className="p-4 border-gold/30">
                  <h3 className="section-title flex items-center gap-2">
                    <span>⚙️</span>
                    <span>管理後台</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/admin">
                      <Card hover>
                        <div className="p-3 text-center">
                          <div className="text-xl mb-1">🏢</div>
                          <div className="text-xs text-text-secondary">管理後台</div>
                          <div className="text-sm font-semibold text-text-primary">進入管理</div>
                        </div>
                      </Card>
                    </Link>
                    <Link href="/admin/sessions/new">
                      <Card hover>
                        <div className="p-3 text-center">
                          <div className="text-xl mb-1">➕</div>
                          <div className="text-xs text-text-secondary">建立場次</div>
                          <div className="text-sm font-semibold text-text-primary">新增評鑑</div>
                        </div>
                      </Card>
                    </Link>
                  </div>
                </div>
              </Card>
            )}

            {/* 快速連結 */}
            <div>
              <h2 className="section-title">
                {employee?.role === "owner" ? "一般功能" : "快速連結"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/tasks">
                  <Card hover>
                    <div className="p-4 text-center">
                      <div className="text-2xl mb-2">📝</div>
                      <div className="text-sm text-text-secondary mb-1">我的任務</div>
                      <div className="text-base font-semibold text-text-primary">查看任務</div>
                    </div>
                  </Card>
                </Link>
                <Link href="/me">
                  <Card hover>
                    <div className="p-4 text-center">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm text-text-secondary mb-1">我的回饋</div>
                      <div className="text-base font-semibold text-text-primary">查看回饋</div>
                    </div>
                  </Card>
                </Link>
                <Link href="/rewards">
                  <Card hover>
                    <div className="p-4 text-center">
                      <div className="text-2xl mb-2">🪙</div>
                      <div className="text-sm text-text-secondary mb-1">我的積分</div>
                      <div className="text-base font-semibold text-text-primary">積分系統</div>
                    </div>
                  </Card>
                </Link>
                <Link href="/rewards/leaderboard">
                  <Card hover>
                    <div className="p-4 text-center">
                      <div className="text-2xl mb-2">🏆</div>
                      <div className="text-sm text-text-secondary mb-1">排行榜</div>
                      <div className="text-base font-semibold text-text-primary">查看排名</div>
                    </div>
                  </Card>
                </Link>
              </div>
            </div>
          </div>
        </MobileLayout>
      )}
    </AuthGuard>
  );
}

