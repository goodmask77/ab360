"use client";

import { useEffect, useState } from "react";
import { getSessionAssignments } from "@/lib/api/assignments";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import type { EvaluationAssignment } from "@/lib/api/assignments";

interface EmployeeProgress {
  id: string;
  name: string;
  department: string;
  self_completed: boolean;
  peer_completed: number;
  peer_total: number;
}

export default function SessionAssignmentsTab({ sessionId }: { sessionId: string }) {
  const [assignments, setAssignments] = useState<EvaluationAssignment[]>([]);
  const [employees, setEmployees] = useState<EmployeeProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, [sessionId]);

  const loadData = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const [assignmentsData, { data: employeesData, error: employeesError }] = await Promise.all([
        getSessionAssignments(sessionId),
        supabase
          .from("employees")
          .select("id, name, department"),
      ]);

      if (employeesError) {
        console.error("[API ERROR] get employees:", employeesError);
        throw employeesError;
      }

      setAssignments(assignmentsData);

      // 計算每位員工的進度
      const progressMap: Record<string, EmployeeProgress> = {};
      for (const emp of employeesData || []) {
        progressMap[emp.id] = {
          id: emp.id,
          name: emp.name,
          department: emp.department || "",
          self_completed: false,
          peer_completed: 0,
          peer_total: 0,
        };
      }

      for (const assignment of assignmentsData) {
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

      setEmployees(Object.values(progressMap));
    } catch (error) {
      console.error("[API ERROR] load assignments data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAssignments = async () => {
    if (!confirm("確定要自動產生分配嗎？這將為所有員工建立自評和同部門互評任務。")) {
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(`/api/sessions/${sessionId}/generate-assignments`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "產生分配失敗");
      }

      alert(`成功產生 ${data.count} 筆分配記錄`);
      await loadData();
    } catch (error: any) {
      alert("產生分配失敗: " + error.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 產生分配按鈕 */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">員工進度</h3>
        <button
          onClick={handleGenerateAssignments}
          disabled={generating || assignments.length > 0}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating ? "產生中..." : assignments.length > 0 ? "已產生分配" : "自動產生分配"}
        </button>
      </div>

      {/* 員工列表 */}
      {employees.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">目前沒有員工資料</p>
        </div>
      ) : (
        <div className="space-y-3">
          {employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900">{employee.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {employee.department === "front"
                      ? "外場"
                      : employee.department === "back"
                      ? "內場"
                      : employee.department}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {/* 自評狀態 */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">自評</span>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      employee.self_completed
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {employee.self_completed ? "已完成" : "待處理"}
                  </span>
                </div>

                {/* 互評進度 */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">互評</span>
                  <span className="text-gray-900 font-medium">
                    已完成 {employee.peer_completed} / {employee.peer_total}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

