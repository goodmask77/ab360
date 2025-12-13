"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { getAllSessions, getSessionCompletion, type EvaluationSession } from "@/lib/api/sessions";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Card from "@/components/Card";
import Button from "@/components/Button";
import StatusBadge from "@/components/StatusBadge";
import ProgressBar from "@/components/ProgressBar";

interface SessionWithCompletion extends EvaluationSession {
  completion: {
    total: number;
    completed: number;
    percentage: number;
  };
}

export default function AdminPage() {
  const { isAdmin, loading } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionWithCompletion[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/home");
    } else if (!loading && isAdmin) {
      loadSessions();
    }
  }, [isAdmin, loading, router]);

  const loadSessions = async () => {
    try {
      const allSessions = await getAllSessions();
      const sessionsWithCompletion: SessionWithCompletion[] = [];

      for (const session of allSessions) {
        const completion = await getSessionCompletion(session.id);
        sessionsWithCompletion.push({
          ...session,
          completion,
        });
      }

      setSessions(sessionsWithCompletion);
    } catch (error) {
      console.error("[API ERROR] load sessions:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return "success";
      case "closed":
        return "info";
      case "draft":
      default:
        return "warning";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open":
        return "進行中";
      case "closed":
        return "已結束";
      case "draft":
      default:
        return "草稿";
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
    <AuthGuard requireAuth={true} requireAdmin={true}>
      {loading || loadingSessions ? (
        <MobileLayout title="管理後台">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-text-secondary">載入中...</div>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title="管理後台">
          <div className="space-y-4">
            {/* 快速操作 */}
            <div className="grid grid-cols-2 gap-3">
              <Link href="/admin/sessions/new">
                <Button fullWidth variant="primary">
                  + 建立場次
                </Button>
              </Link>
              <Link href="/admin/employees">
                <Button fullWidth variant="primary">
                  👥 員工進度
                </Button>
              </Link>
              <Link href="/admin/employees/manage">
                <Button fullWidth variant="primary">
                  👤 員工管理
                </Button>
              </Link>
              <Link href="/admin/rewards">
                <Button fullWidth variant="primary">
                  🎁 積分管理
                </Button>
              </Link>
              <Link href="/admin/debug-tools">
                <Button fullWidth variant="primary" size="sm">
                  <span>🔧</span>
                  <span className="ml-1">測試工具</span>
                </Button>
              </Link>
            </div>
            
            {/* 修復管理員帳號按鈕（如果沒有管理員權限時顯示） */}
            {!isAdmin && (
              <Card>
                <div className="p-4 border-gold-dark/30">
                  <p className="text-sm text-gold-dark mb-3">
                    ⚠️ 您目前沒有管理員權限。點擊下方按鈕自動修復：
                  </p>
                  <Link href="/admin/fix-admin">
                    <Button fullWidth variant="gold">
                      🔧 修復管理員帳號
                    </Button>
                  </Link>
                </div>
              </Card>
            )}
            
            {/* 權限提示 */}
            {!isAdmin && (
              <Card>
                <div className="p-4 border-gold-dark/30">
                  <p className="text-sm text-gold-dark">
                    ⚠️ 您目前沒有管理員權限。如需訪問測試工具，請聯繫系統管理員將您的帳號設為 <code className="bg-dark-surface text-gold px-1 rounded">manager</code> 或 <code className="bg-dark-surface text-gold px-1 rounded">owner</code>。
                  </p>
                </div>
              </Card>
            )}

            {/* 場次列表 */}
            {sessions.length === 0 ? (
              <Card>
                <div className="p-6 text-center">
                  <p className="text-text-secondary">目前沒有評鑑場次</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Link key={session.id} href={`/admin/sessions/${session.id}`}>
                    <Card hover>
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-semibold text-text-primary mb-1">{session.name}</h3>
                            {(session.start_at || session.end_at) && (
                              <p className="text-sm text-text-secondary">
                                {formatDate(session.start_at)} ~ {formatDate(session.end_at)}
                              </p>
                            )}
                          </div>
                          <StatusBadge status={getStatusBadge(session.status) as any}>
                            {getStatusText(session.status)}
                          </StatusBadge>
                        </div>

                        {/* 完成度 */}
                        <div className="mt-3">
                          <ProgressBar
                            current={session.completion.completed}
                            total={session.completion.total}
                            label={`完成進度 (${session.completion.percentage}%)`}
                          />
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </MobileLayout>
      )}
    </AuthGuard>
  );
}

