"use client";

import { useState, useEffect } from "react";
import {
  type Question,
  type CreateQuestionInput,
  type UpdateQuestionInput,
} from "@/lib/api/questions";

interface QuestionFormProps {
  question?: Question | null;
  sessionId: string;
  onSubmit: (data: CreateQuestionInput | UpdateQuestionInput) => Promise<void>;
  onCancel: () => void;
}

export default function QuestionForm({
  question,
  sessionId,
  onSubmit,
  onCancel,
}: QuestionFormProps) {
  const [formData, setFormData] = useState({
    category: question?.category || "",
    question_text: question?.question_text || "",
    type: question?.type || ("scale_1_5" as "scale_1_5" | "text"),
    target_type: question?.target_type || ("both" as "self" | "peer" | "both"),
    for_department: question?.for_department || ("all" as "front" | "back" | "all" | null),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (question) {
        await onSubmit(formData as UpdateQuestionInput);
      } else {
        await onSubmit({
          ...formData,
          session_id: sessionId,
          order_index: 0, // 將在後端計算
        } as CreateQuestionInput);
      }
    } catch (err: any) {
      setError(err.message || "操作失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">分類</label>
        <input
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          placeholder="例如：工作態度、團隊合作"
          required
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">題目內容</label>
        <textarea
          value={formData.question_text}
          onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
          placeholder="請輸入題目內容"
          required
          rows={3}
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">題型</label>
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({ ...formData, type: e.target.value as "scale_1_5" | "text" })
          }
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="scale_1_5">1-5 分數評分</option>
          <option value="text">文字回答</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">適用對象</label>
        <select
          value={formData.target_type}
          onChange={(e) =>
            setFormData({
              ...formData,
              target_type: e.target.value as "self" | "peer" | "both",
            })
          }
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="self">僅自評</option>
          <option value="peer">僅互評</option>
          <option value="both">自評與互評</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">適用部門</label>
        <select
          value={formData.for_department || "all"}
          onChange={(e) =>
            setFormData({
              ...formData,
              for_department: e.target.value as "front" | "back" | "all",
            })
          }
          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value="all">全部</option>
          <option value="front">外場</option>
          <option value="back">內場</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "儲存中..." : question ? "更新" : "建立"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          取消
        </button>
      </div>
    </form>
  );
}

