"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

interface EvaluationTask {
  id: string;
  session_id: string;
  session_name: string;
  target_id: string;
  target_name: string;
  type: "self" | "peer" | "manager";
  status: "pending" | "completed";
}

export default function EmployeeDashboard() {
  const { employee, loading: authLoading } = useAuth();
  const router = useRouter();
  const [selfTasks, setSelfTasks] = useState<EvaluationTask[]>([]);
  const [peerTasks, setPeerTasks] = useState<EvaluationTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!employee) {
        // 如果沒有員工資料，可能是 RLS 問題或資料不存在
        setLoading(false);
        return;
      }
      loadTasks();
    }
  }, [employee, authLoading]);

  const loadTasks = async () => {
    if (!employee) return;

    try {
      const supabase = createBrowserSupabaseClient();

      // 查詢自評任務
      const { data: selfRecords, error: selfError } = await supabase
        .from("evaluation_records")
        .select(
          `
          id,
          session_id,
          type,
          evaluation_sessions!inner(name, status),
          target_id
        `
        )
        .eq("evaluator_id", employee.id)
        .eq("target_id", employee.id)
        .eq("type", "self")
        .eq("evaluation_sessions.status", "open");

      if (selfError) throw selfError;

      const selfTasksData: EvaluationTask[] =
        selfRecords?.map((record: any) => ({
          id: record.id,
          session_id: record.session_id,
          session_name: record.evaluation_sessions.name,
          target_id: record.target_id,
          target_name: employee.name,
          type: "self",
          status: "pending",
        })) || [];

      // 檢查是否已完成（有 evaluation_scores）
      for (const task of selfTasksData) {
        const { data: scores } = await supabase
          .from("evaluation_scores")
          .select("id")
          .eq("record_id", task.id)
          .limit(1);

        if (scores && scores.length > 0) {
          task.status = "completed";
        }
      }

      setSelfTasks(selfTasksData);

      // 查詢同儕評任務
      const { data: peerRecords, error: peerError } = await supabase
        .from("evaluation_records")
        .select(
          `
          id,
          session_id,
          type,
          target_id,
          evaluation_sessions!inner(name, status)
        `
        )
        .eq("evaluator_id", employee.id)
        .neq("target_id", employee.id)
        .eq("type", "peer")
        .eq("evaluation_sessions.status", "open");

      if (peerError) throw peerError;

      // 取得被評人的姓名
      const peerTasksData: EvaluationTask[] = [];
      for (const record of peerRecords || []) {
        const { data: targetEmployee } = await supabase
          .from("employees")
          .select("name")
          .eq("id", record.target_id)
          .maybeSingle();

        peerTasksData.push({
          id: record.id,
          session_id: record.session_id,
          session_name: (record as any).evaluation_sessions.name,
          target_id: record.target_id,
          target_name: targetEmployee?.name || "未知",
          type: "peer",
          status: "pending",
        });
      }

      // 檢查是否已完成
      for (const task of peerTasksData) {
        const { data: scores } = await supabase
          .from("evaluation_scores")
          .select("id")
          .eq("record_id", task.id)
          .limit(1);

        if (scores && scores.length > 0) {
          task.status = "completed";
        }
      }

      setPeerTasks(peerTasksData);
    } catch (error) {
      console.error("[API ERROR] load dashboard tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-red-600 font-semibold">無法載入員工資料</div>
        <div className="text-gray-600 text-sm text-center max-w-md">
          <p>可能的原因：</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>員工資料尚未建立（需要在 Supabase 的 employees 表中建立對應記錄）</li>
            <li>RLS 政策設定問題</li>
            <li>auth_user_id 與 Supabase Auth 的 user.id 不匹配</li>
          </ul>
          <p className="mt-4 text-xs">
            請檢查瀏覽器 Console 的錯誤訊息，或參考 SETUP_GUIDE.md 建立員工資料。
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">載入任務中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">員工儀表板</h1>

      {/* 自評任務區塊 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">自評任務</h2>
        {selfTasks.length === 0 ? (
          <p className="text-gray-500">目前沒有待處理的自評任務</p>
        ) : (
          <ul className="space-y-3">
            {selfTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <span className="font-medium text-gray-900">{task.session_name}</span>
                  <span
                    className={`ml-3 px-2 py-1 text-xs rounded ${
                      task.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.status === "pending" ? "待處理" : "已完成"}
                  </span>
                </div>
                {task.status === "pending" && (
                  <button
                    onClick={() => router.push(`/evaluate/${task.id}?type=self`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    開始填寫
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 需要評價的夥伴列表 */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">需要你評價的夥伴</h2>
        {peerTasks.length === 0 ? (
          <p className="text-gray-500">目前沒有待評價的夥伴</p>
        ) : (
          <ul className="space-y-3">
            {peerTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div>
                  <span className="font-medium text-gray-900">{task.target_name}</span>
                  <span className="ml-3 text-sm text-gray-500">{task.session_name}</span>
                  <span
                    className={`ml-3 px-2 py-1 text-xs rounded ${
                      task.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.status === "pending" ? "待處理" : "已完成"}
                  </span>
                </div>
                {task.status === "pending" && (
                  <button
                    onClick={() => router.push(`/evaluate/${task.id}?type=peer`)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                  >
                    開始評價
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
