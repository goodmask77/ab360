"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

interface EvaluationRecord {
  id: string;
  evaluator_id: string;
  target_id: string;
  type: string;
  evaluator_name: string;
  target_name: string;
  status: "pending" | "completed";
}

export default function SessionManagePage() {
  const params = useParams();
  const router = useRouter();
  const { employee } = useAuth();
  const sessionId = params.id as string;
  const [sessionName, setSessionName] = useState("");
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee && (employee.role === "manager" || employee.role === "owner")) {
      loadSessionData();
    } else {
      router.push("/dashboard");
    }
  }, [sessionId, employee, router]);

  const loadSessionData = async () => {
    try {
      const supabase = createBrowserSupabaseClient();

      // 載入場次資訊
      const { data: session } = await supabase
        .from("evaluation_sessions")
        .select("name")
        .eq("id", sessionId)
        .single();

      if (session) setSessionName(session.name);

      // 載入評鑑記錄
      const { data: recordsData, error } = await supabase
        .from("evaluation_records")
        .select("id, evaluator_id, target_id, type")
        .eq("session_id", sessionId);

      if (error) throw error;

      // 處理記錄資料
      const processedRecords: EvaluationRecord[] = [];
      for (const record of recordsData || []) {
        const { data: scores } = await supabase
          .from("evaluation_scores")
          .select("id")
          .eq("record_id", record.id)
          .limit(1);

        // 取得評分人和被評人姓名
        const { data: evaluator } = await supabase
          .from("employees")
          .select("name")
          .eq("id", record.evaluator_id)
          .single();

        const { data: target } = await supabase
          .from("employees")
          .select("name")
          .eq("id", record.target_id)
          .single();

        processedRecords.push({
          id: record.id,
          evaluator_id: record.evaluator_id,
          target_id: record.target_id,
          type: record.type,
          evaluator_name: evaluator?.name || "未知",
          target_name: target?.name || "未知",
          status: scores && scores.length > 0 ? "completed" : "pending",
        });
      }

      setRecords(processedRecords);
    } catch (error) {
      console.error("載入資料失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← 返回
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{sessionName}</h1>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">評鑑記錄</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  評分人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  被評人
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  類型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  狀態
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    目前沒有評鑑記錄
                  </td>
                </tr>
              ) : (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.evaluator_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.target_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.type === "self"
                        ? "自評"
                        : record.type === "peer"
                        ? "同儕評"
                        : "主管評"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded ${
                          record.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {record.status === "completed" ? "已完成" : "待處理"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

