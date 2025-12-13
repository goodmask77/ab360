"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { getQuestionsBySession, type Question } from "@/lib/api/questions";
import { getSessionById, type EvaluationSession } from "@/lib/api/sessions";
import { submitEvaluation } from "@/lib/api/evaluations";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import ProgressBar from "@/components/ProgressBar";
import RatingScale from "@/components/RatingScale";

type Step = "questions" | "review" | "success";

export default function SelfEvaluationPage() {
  const params = useParams();
  const router = useRouter();
  const { employee, loading } = useSession();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [step, setStep] = useState<Step>("questions");
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && employee) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, employee, loading]);

  const loadData = async () => {
    try {
      const [sessionData, questionsData] = await Promise.all([
        getSessionById(sessionId),
        getQuestionsBySession(sessionId),
      ]);

      setSession(sessionData);
      // 過濾題目：target_type 為 'self' 或 'both'，且符合部門
      const filteredQuestions = questionsData.filter((q) => {
        if (q.target_type !== "self" && q.target_type !== "both") return false;
        if (q.for_department === "all") return true;
        return q.for_department === employee?.department;
      });
      setQuestions(filteredQuestions);
    } catch (error) {
      console.error("[API ERROR] load evaluation data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStep("review");
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!employee || !session) return;

    // 檢查是否所有題目都已填寫
    const unansweredQuestions = questions.filter((q) => !answers[q.id]);
    if (unansweredQuestions.length > 0) {
      alert(`請完成所有題目（還有 ${unansweredQuestions.length} 題未填寫）`);
      setStep("questions");
      setCurrentQuestionIndex(
        questions.findIndex((q) => unansweredQuestions.includes(q))
      );
      return;
    }

    setSubmitting(true);
    try {
      await submitEvaluation({
        session_id: sessionId,
        target_id: employee.id,
        is_self: true,
        is_named: true, // 自評一律具名
        answers: Object.entries(answers).map(([question_id, answer_value]) => ({
          question_id,
          answer_value,
        })),
      });

      setStep("success");
    } catch (error: any) {
      alert("提交失敗: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = questions.filter((q) => answers[q.id]).length;
  const currentQuestion = questions[currentQuestionIndex];

  if (loading || loadingData) {
    return (
      <MobileLayout title="自評">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">載入中...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!session || questions.length === 0) {
    return (
      <MobileLayout title="自評">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">場次不存在或沒有題目</div>
        </div>
      </MobileLayout>
    );
  }

  // 成功頁面
  if (step === "success") {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="text-6xl animate-bounce">✅</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              感謝你為自己給出回饋！
            </h2>
            <p className="text-gray-600">
              你的自評已成功提交，這將幫助你了解自己的表現。
            </p>
          </div>
          <button
            onClick={() => router.push("/tasks")}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
          >
            返回任務列表
          </button>
        </div>
      </MobileLayout>
    );
  }

  // 確認頁面
  if (step === "review") {
    return (
      <MobileLayout title="確認提交" showBackButton={true} onBack={() => setStep("questions")}>
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ 提醒：送出後無法修改，請確認以下內容
            </p>
          </div>

          <div className="space-y-4">
            {questions.map((question) => (
              <div
                key={question.id}
                className="bg-white rounded-lg p-4 border border-gray-200"
              >
                <h3 className="font-medium text-gray-900 mb-2 text-sm">
                  {question.question_text}
                </h3>
                <div className="text-gray-700">
                  {question.type === "scale_1_5" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">
                        {["😞", "😐", "🙂", "😊", "🤩"][
                          parseInt(answers[question.id] || "1") - 1
                        ]}
                      </span>
                      <span className="font-semibold">
                        {answers[question.id]} 分
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm bg-gray-50 p-3 rounded border">
                      {answers[question.id] || "（未填寫）"}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "提交中..." : "確認提交"}
            </button>
            <button
              onClick={() => setStep("questions")}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-all"
            >
              返回修改
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // 填寫頁面
  return (
    <AuthGuard requireAuth={true}>
      <MobileLayout
        title={session.name}
        showBackButton={true}
        onBack={() => router.push("/tasks")}
      >
        <div className="space-y-6">
          {/* 進度條 */}
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <ProgressBar
              current={answeredCount}
              total={questions.length}
              label={`已完成 ${answeredCount} / ${questions.length} 題`}
            />
          </div>

          {/* 歡迎訊息 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-gray-700">
              💡 誠實填寫自己的表現，幫助自己成長
            </p>
          </div>

          {/* 題目卡片 */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500">
                  第 {currentQuestionIndex + 1} 題，共 {questions.length} 題
                </span>
                <span className="text-xs text-gray-400">
                  {currentQuestion.category}
                </span>
              </div>
              <h2 className="text-lg font-semibold text-gray-900 leading-relaxed">
                {currentQuestion.question_text}
              </h2>
            </div>

            <div className="mt-6">
              {currentQuestion.type === "scale_1_5" ? (
                <RatingScale
                  value={
                    answers[currentQuestion.id]
                      ? parseInt(answers[currentQuestion.id])
                      : null
                  }
                  onChange={(value) =>
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: value.toString(),
                    })
                  }
                />
              ) : (
                <textarea
                  value={answers[currentQuestion.id] || ""}
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [currentQuestion.id]: e.target.value,
                    })
                  }
                  placeholder="請輸入你的想法..."
                  rows={5}
                  className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none placeholder:text-gray-400"
                />
              )}
            </div>
          </div>

          {/* 導航按鈕 */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一題
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 px-4 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              {currentQuestionIndex === questions.length - 1
                ? "確認提交"
                : "下一題"}
            </button>
          </div>
        </div>
      </MobileLayout>
    </AuthGuard>
  );
}
