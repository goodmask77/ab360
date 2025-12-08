"use client";

import { useEffect, useState } from "react";
import {
  getQuestionsBySession,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  createDefaultQuestions,
  type Question,
  type CreateQuestionInput,
  type UpdateQuestionInput,
} from "@/lib/api/questions";
import QuestionForm from "@/components/QuestionForm";

export default function SessionQuestionsTab({ sessionId }: { sessionId: string }) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadQuestions();
  }, [sessionId]);

  const loadQuestions = async () => {
    try {
      const data = await getQuestionsBySession(sessionId);
      setQuestions(data);
    } catch (err: any) {
      setError(err.message || "載入題目失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: CreateQuestionInput | UpdateQuestionInput) => {
    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion.id, data as UpdateQuestionInput);
      } else {
        // 計算新的 order_index
        const maxOrder = questions.length > 0 ? Math.max(...questions.map((q) => q.order_index)) : 0;
        await createQuestion({
          ...(data as CreateQuestionInput),
          order_index: maxOrder + 1,
        });
      }
      setShowForm(false);
      setEditingQuestion(null);
      await loadQuestions();
    } catch (err: any) {
      throw new Error(err.message || "操作失敗");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此題目嗎？")) return;

    try {
      await deleteQuestion(id);
      await loadQuestions();
    } catch (err: any) {
      alert("刪除失敗: " + err.message);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    try {
      const newOrder = [...questions];
      [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
      await reorderQuestions(
        sessionId,
        newOrder.map((q) => q.id)
      );
      await loadQuestions();
    } catch (err: any) {
      alert("移動失敗: " + err.message);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === questions.length - 1) return;

    try {
      const newOrder = [...questions];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      await reorderQuestions(
        sessionId,
        newOrder.map((q) => q.id)
      );
      await loadQuestions();
    } catch (err: any) {
      alert("移動失敗: " + err.message);
    }
  };

  // 依分類分組
  const questionsByCategory = questions.reduce((acc, q) => {
    if (!acc[q.category]) {
      acc[q.category] = [];
    }
    acc[q.category].push(q);
    return acc;
  }, {} as Record<string, Question[]>);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* 新增題目按鈕 */}
      <div className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">題目列表</h3>
          <button
            onClick={() => {
              setEditingQuestion(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + 新增題目
          </button>
        </div>

        {/* 快速新增預設題目 */}
        {questions.length === 0 && (
          <button
            onClick={async () => {
              if (
                !confirm(
                  "確定要快速新增10道預設題目嗎？這會自動建立針對餐飲業基層夥伴的評鑑題目。"
                )
              )
                return;

              try {
                await createDefaultQuestions(sessionId);
                await loadQuestions();
                alert("已成功建立10道預設題目！");
              } catch (err: any) {
                alert("建立失敗: " + err.message);
              }
            }}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-xl hover:shadow-lg transition-all font-medium"
          >
            ⚡ 快速新增預設10道題目
          </button>
        )}
      </div>

      {/* 題目表單 */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <QuestionForm
            question={editingQuestion}
            sessionId={sessionId}
            onSubmit={handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingQuestion(null);
            }}
          />
        </div>
      )}

      {/* 題目列表（依分類分組） */}
      {Object.keys(questionsByCategory).length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-gray-500">目前沒有題目</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
            <div key={category} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">{category}</h4>
              <div className="space-y-3">
                {categoryQuestions.map((question, index) => {
                  const globalIndex = questions.findIndex((q) => q.id === question.id);
                  return (
                    <div
                      key={question.id}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => handleMoveUp(globalIndex)}
                          disabled={globalIndex === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          aria-label="上移"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveDown(globalIndex)}
                          disabled={globalIndex === questions.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                          aria-label="下移"
                        >
                          ↓
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm text-gray-900 font-medium">{question.question_text}</p>
                          <div className="flex gap-2 ml-2">
                            <button
                              onClick={() => {
                                setEditingQuestion(question);
                                setShowForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              編輯
                            </button>
                            <button
                              onClick={() => handleDelete(question.id)}
                              className="text-red-600 hover:text-red-800 text-sm"
                            >
                              刪除
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>
                            {question.type === "scale_1_5" ? "1-5 分數" : "文字"}
                          </span>
                          <span>•</span>
                          <span>
                            {question.target_type === "self"
                              ? "僅自評"
                              : question.target_type === "peer"
                              ? "僅互評"
                              : "自評與互評"}
                          </span>
                          <span>•</span>
                          <span>
                            {question.for_department === "all"
                              ? "全部"
                              : question.for_department === "front"
                              ? "外場"
                              : "內場"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

