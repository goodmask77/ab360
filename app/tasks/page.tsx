"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { getUserAssignments, type EvaluationAssignment } from "@/lib/api/assignments";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";

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

      for (const assignment of assignments.filter((a) => a.status === "pending")) {
        // 取得目標員工資訊
        const { data: target } = await supabase
          .from("employees")
          .select("name, department")
          .eq("id", assignment.target_id)
          .single();

        // 取得場次資訊
        const { data: session } = await supabase
          .from("evaluation_sessions")
          .select("name, status")
          .eq("id", assignment.session_id)
          .single();

        // 只顯示進行中的場次
        if (session?.status === "open") {
          tasksWithDetails.push({
            ...assignment,
            target_name: target?.name || "未知",
            target_department: target?.department || "",
            session_name: session?.name || "未知場次",
          });
        }
      }

      setSelfTasks(tasksWithDetails.filter((t) => t.is_self));
      setPeerTasks(tasksWithDetails.filter((t) => !t.is_self));
    } catch (error) {
      console.error("載入任務失敗:", error);
    } finally {
      setLoadingTasks(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      {loading || loadingTasks ? (
        <MobileLayout title="我的任務">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title="我的任務">
          <div className="space-y-6">
            {/* 自評任務 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">自評任務</h2>
              {selfTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-500">目前沒有自評任務</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selfTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/evaluate/${task.session_id}/self`}
                      className="block bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-blue-300 hover:shadow transition-all"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{task.session_name}</h3>
                      <p className="text-sm text-gray-500">自評</p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 互評任務 */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">互評任務</h2>
              {peerTasks.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-500">目前沒有互評任務</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {peerTasks.map((task) => (
                    <Link
                      key={task.id}
                      href={`/evaluate/${task.session_id}/peer/${task.target_id}`}
                      className="block bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-blue-300 hover:shadow transition-all"
                    >
                      <h3 className="font-semibold text-gray-900 mb-1">{task.target_name}</h3>
                      <p className="text-sm text-gray-500">
                        {task.target_department === "front"
                          ? "外場"
                          : task.target_department === "back"
                          ? "內場"
                          : task.target_department}
                        • {task.session_name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </MobileLayout>
      )}
    </AuthGuard>
  );
}

