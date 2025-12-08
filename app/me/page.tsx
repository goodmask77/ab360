"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import {
  getUserFeedbackSummaries,
  getSessionFeedbackDetail,
  type FeedbackSummary,
  type FeedbackDetail,
} from "@/lib/api/feedback";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Badge from "@/components/Badge";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AISuggestion {
  strengths: string[];
  improvements: string[];
  suggestions: string;
}

export default function MePage() {
  const { employee, loading } = useSession();
  const router = useRouter();
  const [summaries, setSummaries] = useState<FeedbackSummary[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [sessionDetail, setSessionDetail] = useState<FeedbackDetail[]>([]);
  const [aiSuggestion, setAiSuggestion] = useState<AISuggestion | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (!loading && employee) {
      loadSummaries();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, loading]);

  useEffect(() => {
    if (selectedSessionId && employee) {
      loadSessionDetail();
    }
  }, [selectedSessionId, employee]);

  const loadSummaries = async () => {
    if (!employee) return;

    try {
      const data = await getUserFeedbackSummaries(employee.id);
      setSummaries(data);
      if (data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].session_id);
      }
    } catch (error) {
      console.error("[API ERROR] load feedback summaries:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSessionDetail = async () => {
    if (!employee || !selectedSessionId) return;

    setLoadingDetail(true);
    try {
      const data = await getSessionFeedbackDetail(selectedSessionId, employee.id);
      setSessionDetail(data);
    } catch (error) {
      console.error("[API ERROR] load session detail:", error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const generateAISuggestion = async () => {
    if (!employee || !selectedSessionId) return;

    setLoadingAI(true);
    try {
      const response = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: selectedSessionId,
          targetId: employee.id,
        }),
      });

      const data = await response.json();
      setAiSuggestion(data);
    } catch (error) {
      console.error("[API ERROR] generate AI suggestion:", error);
    } finally {
      setLoadingAI(false);
    }
  };

  const selectedSummary = summaries.find((s) => s.session_id === selectedSessionId);

  // 準備雷達圖資料
  const radarData =
    selectedSummary?.category_scores.map((cs) => ({
      category: cs.category,
      self: Math.round(cs.self_score * 10) / 10,
      peer: Math.round(cs.peer_score * 10) / 10,
    })) || [];

  // 準備長條圖資料
  const barData = selectedSummary?.category_scores.map((cs) => ({
    category: cs.category,
    自評: Math.round(cs.self_score * 10) / 10,
    他評: Math.round(cs.peer_score * 10) / 10,
  })) || [];

  return (
    <AuthGuard requireAuth={true}>
      {loading || loadingData ? (
        <MobileLayout title="我的回饋">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        </MobileLayout>
      ) : summaries.length === 0 ? (
        <MobileLayout title="我的回饋">
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-gray-700 font-medium mb-1">目前還沒有回饋資料</p>
            <p className="text-sm text-gray-500">
              完成評鑑任務後，就能在這裡看到夥伴給你的回饋
            </p>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title="我的回饋">
          <div className="space-y-6">
            {/* 場次選擇 */}
            {summaries.length > 1 && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  選擇場次
                </label>
                <select
                  value={selectedSessionId || ""}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                >
                  {summaries.map((s) => (
                    <option key={s.session_id} value={s.session_id}>
                      {s.session_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 總覽卡片 */}
            {selectedSummary && (
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6 border border-emerald-200">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                  {selectedSummary.session_name}
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {selectedSummary.self_average.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">自評平均</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-emerald-600 mb-1">
                      {selectedSummary.peer_average.toFixed(1)}
                    </div>
                    <div className="text-xs text-gray-600">他評平均</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-emerald-200">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">收到回饋</span>
                    <Badge variant="success" size="sm">
                      {selectedSummary.total_evaluators} 位夥伴
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    差異：{" "}
                    {Math.abs(
                      selectedSummary.self_average - selectedSummary.peer_average
                    ).toFixed(1)}{" "}
                    分
                    {selectedSummary.self_average > selectedSummary.peer_average
                      ? "（你對自己要求較高）"
                      : selectedSummary.self_average < selectedSummary.peer_average
                      ? "（夥伴對你評價更高）"
                      : "（自我認知與他人觀感一致）"}
                  </div>
                </div>
              </div>
            )}

            {/* 雷達圖 */}
            {radarData.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">各面向評分</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{ fontSize: 11, fill: "#6B7280" }}
                    />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} />
                    <Radar
                      name="自評"
                      dataKey="self"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.3}
                    />
                    <Radar
                      name="他評"
                      dataKey="peer"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.3}
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* 長條圖 */}
            {barData.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-4">自評 vs 他評</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 10, fill: "#6B7280" }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="自評" fill="#3B82F6" />
                    <Bar dataKey="他評" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* AI 建議 */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">AI 建議</h3>
                {!aiSuggestion && (
                  <button
                    onClick={generateAISuggestion}
                    disabled={loadingAI}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {loadingAI ? "產生中..." : "產生建議"}
                  </button>
                )}
              </div>

              {aiSuggestion ? (
                <div className="space-y-4">
                  {aiSuggestion.strengths.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <span>👍</span>
                        <span>優勢</span>
                      </h4>
                      <ul className="space-y-1">
                        {aiSuggestion.strengths.map((strength, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 bg-emerald-50 p-2 rounded border border-emerald-200"
                          >
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiSuggestion.improvements.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                        <span>💡</span>
                        <span>建議</span>
                      </h4>
                      <ul className="space-y-1">
                        {aiSuggestion.improvements.map((improvement, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-700 bg-amber-50 p-2 rounded border border-amber-200"
                          >
                            {improvement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {aiSuggestion.suggestions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-gray-700">{aiSuggestion.suggestions}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">點擊「產生建議」查看 AI 分析</p>
                </div>
              )}
            </div>

            {/* 詳細回饋 */}
            {loadingDetail ? (
              <div className="text-center py-4 text-gray-500">載入詳細資料中...</div>
            ) : sessionDetail.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900">詳細回饋</h3>
                {sessionDetail.map((detail) => (
                  <div
                    key={detail.question_id}
                    className="bg-white rounded-lg p-4 border border-gray-200"
                  >
                    <h4 className="font-medium text-gray-900 mb-3 text-sm">
                      {detail.question_text}
                    </h4>
                    <div className="space-y-2">
                      {detail.self_answer && (
                        <div>
                          <span className="text-xs font-medium text-blue-600">自評：</span>
                          <span className="text-sm text-gray-700 ml-2">
                            {detail.self_answer}
                          </span>
                        </div>
                      )}
                      {detail.peer_answers.length > 0 && (
                        <div>
                          <span className="text-xs font-medium text-emerald-600">
                            他評平均：{detail.peer_average.toFixed(1)} 分
                          </span>
                          <div className="mt-2 space-y-1">
                            {detail.peer_answers.map((answer, idx) => (
                              <div
                                key={idx}
                                className="text-sm text-gray-700 bg-gray-50 p-2 rounded border"
                              >
                                {answer.is_named && answer.evaluator_name ? (
                                  <span className="font-medium text-emerald-600">
                                    {answer.evaluator_name}：
                                  </span>
                                ) : (
                                  <span className="font-medium text-gray-500">
                                    一位同事：
                                  </span>
                                )}
                                <span className="ml-2">{answer.answer_value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </MobileLayout>
      )}
    </AuthGuard>
  );
}


