"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { getUserAssignments, type EvaluationAssignment } from "@/lib/api/assignments";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Badge from "@/components/Badge";
import AchievementBadge from "@/components/AchievementBadge";

interface TaskWithTarget extends EvaluationAssignment {
  target_name: string;
  target_department: string;
  session_name: string;
}

export default function TasksPage() {
  const { employee, loading } = useSession();
  const router = useRouter();
  const [selfTasks, setSelfTasks] = useState<TaskWithTarget[]>([]);
  const [peerTasks, setPeerTasks] = useState<TaskWithTarget[]>([]);
  const [completedTasks, setCompletedTasks] = useState<TaskWithTarget[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  useEffect(() => {
    if (!loading && employee) {
      loadTasks();
    } else if (!loading && !employee) {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, loading]);

  const loadTasks = async () => {
    if (!employee) return;

    try {
      const assignments = await getUserAssignments(employee.id);
      const supabase = createBrowserSupabaseClient();

      const tasksWithDetails: TaskWithTarget[] = [];
      const completedTasksWithDetails: TaskWithTarget[] = [];

      for (const assignment of assignments) {
        // 取得目標員工資訊
        const { data: target } = await supabase
          .from("employees")
          .select("name, department")
          .eq("id", assignment.target_id)
          .maybeSingle();

        // 取得場次資訊
        const { data: session } = await supabase
          .from("evaluation_sessions")
          .select("name, status")
          .eq("id", assignment.session_id)
          .maybeSingle();

        // 只顯示進行中的場次
        if (session?.status === "open") {
          const taskDetail = {
            ...assignment,
            target_name: target?.name || "未知",
            target_department: target?.department || "",
            session_name: session?.name || "未知場次",
          };

          if (assignment.status === "completed") {
            completedTasksWithDetails.push(taskDetail);
          } else {
            tasksWithDetails.push(taskDetail);
          }
        }
      }

      setSelfTasks(tasksWithDetails.filter((t) => t.is_self));
      setPeerTasks(tasksWithDetails.filter((t) => !t.is_self));
      setCompletedTasks(completedTasksWithDetails);
    } catch (error) {
      console.error("[API ERROR] load tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      {loading || loadingTasks ? (
        <MobileLayout title="我的任務" showHomeButton={true}>
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title="我的任務" showHomeButton={true}>
          <div className="space-y-6">
            {/* 歡迎訊息 */}
            {employee && (
              <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-4 border border-emerald-200">
                <p className="text-sm text-gray-700">
                  👋 嗨 {employee.name}！感謝你為夥伴給出回饋，這會幫助大家一起進步。
                </p>
              </div>
            )}

            {/* 成就徽章 */}
            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">🏆 你的成就</h2>
                <div className="space-y-3">
                  <AchievementBadge
                    icon="✅"
                    title="樂於給回饋"
                    description="已完成所有互評任務"
                    unlocked={peerTasks.length === 0 && completedTasks.filter((t) => !t.is_self).length > 0}
                  />
                  <AchievementBadge
                    icon="🎯"
                    title="準時完成"
                    description="在截止日期前完成所有評鑑"
                    unlocked={selfTasks.length === 0 && peerTasks.length === 0}
                  />
                  <AchievementBadge
                    icon="💪"
                    title="自我成長"
                    description="已完成自評"
                    unlocked={selfTasks.length === 0 && completedTasks.filter((t) => t.is_self).length > 0}
                  />
                </div>
              </div>
            )}

            {/* 待完成任務統計 */}
            {(selfTasks.length > 0 || peerTasks.length > 0) && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">待完成任務</span>
                  <Badge variant="warning" size="sm">
                    {selfTasks.length + peerTasks.length} 個
                  </Badge>
                </div>
                <div className="text-xs text-gray-500">
                  完成所有任務後，就能看到夥伴給你的回饋囉！
                </div>
              </div>
            )}

            {/* 自評任務 */}
            {selfTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>📝</span>
                  <span>自評任務</span>
                </h2>
                <div className="space-y-3">
                  {selfTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/evaluate/${task.session_id}/self`}
                      className="block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 text-lg">
                            {task.session_name}
                          </h3>
                          <p className="text-sm text-gray-600">自我評鑑</p>
                        </div>
                        <Badge variant="primary" size="sm">
                          去填寫
                        </Badge>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        💡 誠實填寫自己的表現，幫助自己成長
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 互評任務 */}
            {peerTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>🤝</span>
                  <span>互評任務</span>
                </h2>
                <div className="space-y-3">
                  {peerTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/evaluate/${task.session_id}/peer/${task.target_id}`}
                      className="block bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 mb-1 text-lg">
                            {task.target_name}
                          </h3>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="info" size="sm">
                              {task.target_department === "front"
                                ? "外場"
                                : task.target_department === "back"
                                ? "內場"
                                : task.target_department}
                            </Badge>
                            <span className="text-xs text-gray-500">{task.session_name}</span>
                          </div>
                        </div>
                        <Badge variant="primary" size="sm">
                          去填寫
                        </Badge>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        💬 給夥伴具體的回饋，幫助彼此一起變強
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* 已完成任務 */}
            {completedTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span>✅</span>
                  <span>已完成</span>
                </h2>
                <div className="space-y-2">
                  {completedTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200 opacity-75"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-700 text-sm">
                            {task.is_self ? task.session_name : task.target_name}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {task.is_self ? "自評" : "互評"} • 已完成
                          </p>
                        </div>
                        <span className="text-2xl">✅</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 空狀態 */}
            {selfTasks.length === 0 && peerTasks.length === 0 && completedTasks.length === 0 && (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-gray-700 font-medium mb-1">目前沒有評鑑任務</p>
                <p className="text-sm text-gray-500">
                  所有任務都已完成，或目前沒有進行中的評鑑場次
                </p>
              </div>
            )}
          </div>
        </MobileLayout>
      )}
    </AuthGuard>
  );
}

