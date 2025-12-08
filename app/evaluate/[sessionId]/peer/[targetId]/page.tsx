"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { getQuestionsBySession, type Question } from "@/lib/api/questions";
import { getSessionById, type EvaluationSession } from "@/lib/api/sessions";
import { submitEvaluation } from "@/lib/api/evaluations";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";

export default function PeerEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const { employee, loading } = useSession();
  const sessionId = params.sessionId as string;
  const targetId = params.targetId as string;
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [targetName, setTargetName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isNamed, setIsNamed] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && employee) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, targetId, employee, loading]);

  const loadData = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const [sessionData, questionsData, { data: target }] = await Promise.all([
        getSessionById(sessionId),
        getQuestionsBySession(sessionId),
        supabase.from("employees").select("name").eq("id", targetId).single(),
      ]);

      setSession(sessionData);
      setTargetName(target?.name || "未知");
      // 過濾題目：target_type 為 'peer' 或 'both'，且符合部門
      const filteredQuestions = questionsData.filter((q) => {
        if (q.target_type !== "peer" && q.target_type !== "both") return false;
        if (q.for_department === "all") return true;
        return q.for_department === employee?.department;
      });
      setQuestions(filteredQuestions);
    } catch (error) {
      console.error("載入資料失敗:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !session) return;

    setSubmitting(true);
    try {
      await submitEvaluation({
        session_id: sessionId,
        target_id: targetId,
        is_self: false,
        is_named: isNamed,
        answers: Object.entries(answers).map(([question_id, answer_value]) => ({
          question_id,
          answer_value,
        })),
      });

      alert("評鑑已提交");
      router.push("/tasks");
    } catch (error: any) {
      alert("提交失敗: " + error.message);
    } finally {
      setSubmitting(false);
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

  return (
    <AuthGuard requireAuth={true}>
      {loading || loadingData ? (
        <MobileLayout title="互評">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        </MobileLayout>
      ) : !session ? (
        <MobileLayout title="互評">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">場次不存在</div>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title={`評鑑 ${targetName}`} showBackButton={true} onBack={() => router.push("/tasks")}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-3">
                您正在評鑑：<span className="font-semibold">{targetName}</span>
              </p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isNamed}
                    onChange={(e) => setIsNamed(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">本次給對方看到的評論：具名</span>
                </label>
              </div>
            </div>

            {Object.entries(questionsByCategory).map(([category, categoryQuestions]) => (
              <div key={category} className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">{category}</h3>
                <div className="space-y-4">
                  {categoryQuestions.map((question) => (
                    <div key={question.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {question.question_text}
                      </label>
                      {question.type === "scale_1_5" ? (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((score) => (
                            <button
                              key={score}
                              type="button"
                              onClick={() =>
                                setAnswers({ ...answers, [question.id]: score.toString() })
                              }
                              className={`flex-1 py-3 px-2 rounded-lg font-medium transition-colors ${
                                answers[question.id] === score.toString()
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <textarea
                          value={answers[question.id] || ""}
                          onChange={(e) =>
                            setAnswers({ ...answers, [question.id]: e.target.value })
                          }
                          placeholder="請輸入您的回答"
                          rows={3}
                          className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "提交中..." : "提交評鑑"}
            </button>
          </form>
        </MobileLayout>
      )}
    </AuthGuard>
  );
}

