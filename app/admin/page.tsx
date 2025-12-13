"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { getAllSessions, getSessionCompletion, type EvaluationSession } from "@/lib/api/sessions";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-dark-card text-gold border border-gold/50";
      case "closed":
        return "bg-dark-surface text-gray-400 border border-dark-border";
      case "draft":
      default:
        return "bg-dark-card text-gold-dark border border-gold-dark/30";
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
            <div className="text-gray-400">載入中...</div>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title="管理後台">
          <div className="space-y-4">
            {/* 快速操作 */}
            <div className="grid grid-cols-2 gap-3">
              <Link
                href="/admin/sessions/new"
                className="btn-primary-tech text-center py-3 px-4"
              >
                + 建立場次
              </Link>
              <Link
                href="/admin/employees"
                className="btn-primary-tech text-center py-3 px-4"
              >
                👥 員工進度
              </Link>
              <Link
                href="/admin/employees/manage"
                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-center py-3 px-4 rounded-xl hover:shadow-lg transition-all font-medium"
              >
                👤 員工管理
              </Link>
              <Link
                href="/admin/rewards"
                className="btn-primary-tech text-center py-3 px-4"
              >
                🎁 積分管理
              </Link>
              <Link
                href="/admin/debug-tools"
                className="btn-primary-tech text-center py-3 px-4 flex items-center justify-center gap-1"
              >
                <span>🔧</span>
                <span>測試工具</span>
                <span className="text-xs opacity-75">(生成數據)</span>
              </Link>
            </div>
            
            {/* 修復管理員帳號按鈕（如果沒有管理員權限時顯示） */}
            {!isAdmin && (
              <div className="card-tech p-4 border-gold-dark/30">
                <p className="text-sm text-gray-300 mb-3">
                  ⚠️ 您目前沒有管理員權限。點擊下方按鈕自動修復：
                </p>
                <Link
                  href="/admin/fix-admin"
                  className="btn-primary-tech block w-full text-center py-3 px-4"
                >
                  🔧 修復管理員帳號
                </Link>
              </div>
            )}
            
            {/* 權限提示 */}
            {!isAdmin && (
              <div className="card-tech p-4 border-gold-dark/30">
                <p className="text-sm text-gray-300">
                  ⚠️ 您目前沒有管理員權限。如需訪問測試工具，請聯繫系統管理員將您的帳號設為 <code className="bg-dark-surface text-gold px-1 rounded">manager</code> 或 <code className="bg-dark-surface text-gold px-1 rounded">owner</code>。
                </p>
              </div>
            )}

            {/* 場次列表 */}
            {sessions.length === 0 ? (
              <div className="card-tech p-6 text-center">
                <p className="text-gray-400">目前沒有評鑑場次</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/admin/sessions/${session.id}`}
                    className="block card-tech p-4 hover:border-gold/50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-100 mb-1">{session.name}</h3>
                        {(session.start_at || session.end_at) && (
                          <p className="text-sm text-gray-400">
                            {formatDate(session.start_at)} ~ {formatDate(session.end_at)}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(
                          session.status
                        )}`}
                      >
                        {getStatusText(session.status)}
                      </span>
                    </div>

                    {/* 完成度 */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-400">完成進度</span>
                        <span className="text-gray-200 font-medium">
                          {session.completion.completed} / {session.completion.total} (
                          {session.completion.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-dark-surface rounded-full h-2 border border-dark-border">
                        <div
                          className="bg-gradient-to-r from-gold-dark to-gold h-2 rounded-full transition-all"
                          style={{ width: `${session.completion.percentage}%` }}
                        />
                      </div>
                    </div>
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

