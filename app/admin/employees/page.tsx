"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import { getSessionAssignments } from "@/lib/api/assignments";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Badge from "@/components/Badge";

interface EmployeeProgress {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  self_completed: boolean;
  peer_completed: number;
  peer_total: number;
  received_feedback: number;
}

export default function AdminEmployeesPage() {
  const { isAdmin, loading } = useSession();
  const router = useRouter();
  const [employees, setEmployees] = useState<EmployeeProgress[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push("/home");
    } else if (!loading && isAdmin) {
      loadData();
    }
  }, [isAdmin, loading, router]);

  const loadData = async () => {
    try {
      const supabase = createBrowserSupabaseClient();

      // 取得所有場次
      const { data: sessionsData } = await supabase
        .from("evaluation_sessions")
        .select("id, name, status")
        .order("created_at", { ascending: false });

      setSessions(sessionsData || []);

      // 取得所有員工
      const { data: employeesData } = await supabase
        .from("employees")
        .select("id, name, email, department, role")
        .order("name");

      if (!employeesData) return;

      // 如果有場次，計算進度
      if (sessionsData && sessionsData.length > 0) {
        const activeSession = sessionsData.find((s) => s.status === "open");
        if (activeSession) {
          setSelectedSessionId(activeSession.id);
          await loadEmployeeProgress(activeSession.id, employeesData);
        } else {
          // 沒有進行中的場次，只顯示員工列表
          setEmployees(
            employeesData.map((emp) => ({
              id: emp.id,
              name: emp.name,
              email: emp.email,
              department: emp.department || "",
              role: emp.role,
              self_completed: false,
              peer_completed: 0,
              peer_total: 0,
              received_feedback: 0,
            }))
          );
        }
      } else {
        // 沒有場次，只顯示員工列表
        setEmployees(
          employeesData.map((emp) => ({
            id: emp.id,
            name: emp.name,
            email: emp.email,
            department: emp.department || "",
            role: emp.role,
            self_completed: false,
            peer_completed: 0,
            peer_total: 0,
            received_feedback: 0,
          }))
        );
      }
    } catch (error) {
      console.error("[API ERROR] load employees:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadEmployeeProgress = async (
    sessionId: string,
    employeesData: any[]
  ) => {
    try {
      const assignments = await getSessionAssignments(sessionId);
      const supabase = createBrowserSupabaseClient();

      const progressMap: Record<string, EmployeeProgress> = {};

      // 初始化
      for (const emp of employeesData) {
        progressMap[emp.id] = {
          id: emp.id,
          name: emp.name,
          email: emp.email,
          department: emp.department || "",
          role: emp.role,
          self_completed: false,
          peer_completed: 0,
          peer_total: 0,
          received_feedback: 0,
        };
      }

      // 計算進度
      for (const assignment of assignments) {
        if (!progressMap[assignment.evaluator_id]) continue;

        if (assignment.is_self) {
          progressMap[assignment.evaluator_id].self_completed =
            assignment.status === "completed";
        } else {
          progressMap[assignment.evaluator_id].peer_total++;
          if (assignment.status === "completed") {
            progressMap[assignment.evaluator_id].peer_completed++;
          }
        }
      }

      // 計算收到的回饋數
      const { data: feedbackRecords } = await supabase
        .from("evaluation_records")
        .select("target_id")
        .eq("session_id", sessionId);

      for (const record of feedbackRecords || []) {
        if (progressMap[record.target_id]) {
          progressMap[record.target_id].received_feedback++;
        }
      }

      setEmployees(Object.values(progressMap));
    } catch (error) {
      console.error("[API ERROR] load employee progress:", error);
    }
  };

  const handleSessionChange = async (sessionId: string) => {
    setSelectedSessionId(sessionId);
    const supabase = createBrowserSupabaseClient();
    const { data: employeesData } = await supabase
      .from("employees")
      .select("id, name, email, department, role")
      .order("name");

    if (employeesData && sessionId) {
      await loadEmployeeProgress(sessionId, employeesData);
    }
  };

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      {loading || loadingData ? (
        <MobileLayout title="員工進度">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title="員工進度">
          <div className="space-y-4">
            {/* 場次選擇 */}
            {sessions.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇場次
                </label>
                <select
                  value={selectedSessionId || ""}
                  onChange={(e) => handleSessionChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  <option value="">-- 選擇場次 --</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status === "open" ? "進行中" : s.status === "closed" ? "已結束" : "草稿"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 員工列表 */}
            {employees.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center border border-gray-200">
                <p className="text-gray-500">目前沒有員工資料</p>
              </div>
            ) : (
              <div className="space-y-3">
                {employees.map((employee) => (
                  <Link
                    key={employee.id}
                    href={`/admin/employees/${employee.id}`}
                    className="block bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {employee.name}
                        </h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={
                              employee.department === "front"
                                ? "info"
                                : employee.department === "back"
                                ? "primary"
                                : "default"
                            }
                            size="sm"
                          >
                            {employee.department === "front"
                              ? "外場"
                              : employee.department === "back"
                              ? "內場"
                              : employee.department || "未設定"}
                          </Badge>
                          {employee.role === "manager" && (
                            <Badge variant="warning" size="sm">
                              管理者
                            </Badge>
                          )}
                          {employee.role === "owner" && (
                            <Badge variant="primary" size="sm">
                              負責人
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{employee.email}</p>
                      </div>
                    </div>

                    {selectedSessionId && (
                      <div className="space-y-2 pt-3 border-t border-gray-200">
                        {/* 自評狀態 */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">自評</span>
                          <Badge
                            variant={employee.self_completed ? "success" : "warning"}
                            size="sm"
                          >
                            {employee.self_completed ? "✅ 已完成" : "⏳ 待處理"}
                          </Badge>
                        </div>

                        {/* 互評進度 */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">互評</span>
                          <span className="text-gray-900 font-medium">
                            已完成 {employee.peer_completed} / {employee.peer_total}
                          </span>
                        </div>

                        {/* 收到回饋 */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">收到回饋</span>
                          <Badge variant="info" size="sm">
                            {employee.received_feedback} 份
                          </Badge>
                        </div>
                      </div>
                    )}
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


