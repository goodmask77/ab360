"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { type EvaluationSession } from "@/lib/api/sessions";

interface SessionSettingsTabProps {
  session: EvaluationSession;
  onUpdate: (updates: Partial<EvaluationSession>) => Promise<void>;
  onReload: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export default function SessionSettingsTab({
  session,
  onUpdate,
  onReload,
  onDelete,
}: SessionSettingsTabProps) {
  const router = useRouter();
  const sessionWithRewards = session as any;
  const [formData, setFormData] = useState({
    name: session.name,
    start_at: session.start_at ? new Date(session.start_at).toISOString().split("T")[0] : "",
    end_at: session.end_at ? new Date(session.end_at).toISOString().split("T")[0] : "",
    status: session.status,
    reward_pool_points: sessionWithRewards?.reward_pool_points ?? 1000,
    vote_quota_per_user: sessionWithRewards?.vote_quota_per_user ?? 100,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onUpdate({
        name: formData.name,
        start_at: formData.start_at || null,
        end_at: formData.end_at || null,
        status: formData.status as "draft" | "open" | "closed",
        reward_pool_points: formData.reward_pool_points,
        vote_quota_per_user: formData.vote_quota_per_user,
      } as any);
      await onReload();
      alert("場次已更新");
    } catch (err: any) {
      setError(err.message || "更新失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: "draft" | "open" | "closed") => {
    if (newStatus === "closed" && session.status === "open") {
      if (!confirm("確定要結束此場次嗎？結束後將無法再進行評鑑。")) {
        return;
      }
    }

    try {
      await onUpdate({ status: newStatus });
      await onReload();
      alert("狀態已更新");
    } catch (err: any) {
      alert("更新狀態失敗: " + err.message);
    }
  };

  const handleDelete = async () => {
    const confirmMessage = `確定要刪除場次「${session.name}」嗎？\n\n此操作將永久刪除：\n- 場次資訊\n- 所有評鑑記錄\n- 所有分配任務\n\n此操作無法復原！`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    // 二次確認
    if (!confirm("最後確認：確定要刪除此場次嗎？")) {
      return;
    }

    try {
      await onDelete();
    } catch (err: any) {
      alert("刪除場次失敗: " + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* 基本資訊表單 */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-4 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">基本資訊</h3>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">場次名稱</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder:text-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">開始日期</label>
          <input
            type="date"
            value={formData.start_at}
            onChange={(e) => setFormData({ ...formData, start_at: e.target.value })}
            className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">結束日期</label>
          <input
            type="date"
            value={formData.end_at}
            onChange={(e) => setFormData({ ...formData, end_at: e.target.value })}
            className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* 積分設定 */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">積分設定</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                獎金池總點數
              </label>
              <input
                type="number"
                min="0"
                value={formData.reward_pool_points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reward_pool_points: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每位使用者可分配點數
              </label>
              <input
                type="number"
                min="0"
                value={formData.vote_quota_per_user}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    vote_quota_per_user: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-4 py-3 text-base text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "儲存中..." : "儲存變更"}
        </button>
      </form>

      {/* 狀態切換 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">狀態管理</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">目前狀態</span>
            <span
              className={`px-3 py-1 rounded text-sm font-medium ${
                session.status === "open"
                  ? "bg-green-100 text-green-800"
                  : session.status === "closed"
                  ? "bg-gray-100 text-gray-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {session.status === "open"
                ? "進行中"
                : session.status === "closed"
                ? "已結束"
                : "草稿"}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            {session.status !== "draft" && (
              <button
                onClick={() => handleStatusChange("draft")}
                className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                設為草稿
              </button>
            )}
            {session.status !== "open" && (
              <button
                onClick={() => handleStatusChange("open")}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                開始場次
              </button>
            )}
            {session.status !== "closed" && (
              <button
                onClick={() => handleStatusChange("closed")}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
              >
                結束場次
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 刪除場次 */}
      <div className="bg-white rounded-lg shadow-sm p-4 border-t-4 border-red-500">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 text-red-600">危險操作</h3>
        <p className="text-sm text-gray-600 mb-4">
          刪除此場次將永久移除所有相關資料，包括評鑑記錄、分配任務等。此操作無法復原。
        </p>
        <button
          onClick={handleDelete}
          className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          刪除此場次
        </button>
      </div>
    </div>
  );
}

