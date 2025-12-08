"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

interface EvaluationSession {
  id: string;
  name: string;
  status: "draft" | "open" | "closed";
  start_at: string | null;
  end_at: string | null;
  created_at: string;
}

export default function AdminDashboard() {
  const { employee, loading: authLoading } = useAuth();
  const router = useRouter();
  const [sessions, setSessions] = useState<EvaluationSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSession, setNewSession] = useState({
    name: "",
    start_at: "",
    end_at: "",
    status: "draft" as "draft" | "open" | "closed",
  });

  useEffect(() => {
    if (!authLoading) {
      if (!employee || (employee.role !== "manager" && employee.role !== "owner")) {
        router.push("/dashboard");
        return;
      }
      loadSessions();
    }
  }, [employee, authLoading, router]);

  const loadSessions = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { data, error } = await supabase
        .from("evaluation_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error("載入場次失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const { error } = await supabase.from("evaluation_sessions").insert([
        {
          name: newSession.name,
          start_at: newSession.start_at || null,
          end_at: newSession.end_at || null,
          status: newSession.status,
        },
      ]);

      if (error) throw error;

      setShowCreateModal(false);
      setNewSession({ name: "", start_at: "", end_at: "", status: "draft" });
      loadSessions();
    } catch (error: any) {
      alert("建立場次失敗: " + error.message);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      draft: { label: "草稿", className: "bg-gray-100 text-gray-800" },
      open: { label: "進行中", className: "bg-green-100 text-green-800" },
      closed: { label: "已結束", className: "bg-red-100 text-red-800" },
    };
    const statusInfo = statusMap[status] || statusMap.draft;
    return (
      <span className={`px-2 py-1 text-xs rounded ${statusInfo.className}`}>
        {statusInfo.label}
      </span>
    );
  };

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("zh-TW");
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
          <p>請確認已在 Supabase 的 employees 表中建立對應記錄。</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-500">載入場次中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">管理後台</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          建立新場次
        </button>
      </div>

      {/* 評鑑場次列表 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">評鑑場次列表</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  場次名稱
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  狀態
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  開始日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  結束日期
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    目前沒有評鑑場次
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={session.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{session.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.start_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(session.end_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => router.push(`/admin/sessions/${session.id}`)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        進入管理
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 建立新場次 Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">建立新場次</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  場次名稱
                </label>
                <input
                  type="text"
                  value={newSession.name}
                  onChange={(e) =>
                    setNewSession({ ...newSession, name: e.target.value })
                  }
                  placeholder="例如：2025/04 月度 360"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  開始日期
                </label>
                <input
                  type="date"
                  value={newSession.start_at}
                  onChange={(e) =>
                    setNewSession({ ...newSession, start_at: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  結束日期
                </label>
                <input
                  type="date"
                  value={newSession.end_at}
                  onChange={(e) =>
                    setNewSession({ ...newSession, end_at: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  狀態
                </label>
                <select
                  value={newSession.status}
                  onChange={(e) =>
                    setNewSession({
                      ...newSession,
                      status: e.target.value as "draft" | "open" | "closed",
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="draft">草稿</option>
                  <option value="open">進行中</option>
                  <option value="closed">已結束</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateSession}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                建立
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
