"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

const DIMENSIONS = [
  { code: "attendance", label: "出勤表現" },
  { code: "attitude", label: "工作態度" },
  { code: "teamwork", label: "團隊合作" },
  { code: "communication", label: "溝通能力" },
  { code: "responsibility", label: "責任感" },
];

export default function EvaluatePage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { employee } = useAuth();
  const recordId = params.id as string;
  const type = searchParams.get("type") || "peer";

  const [targetName, setTargetName] = useState("");
  const [sessionName, setSessionName] = useState("");
  const [scores, setScores] = useState<Record<string, number>>({});
  const [positiveText, setPositiveText] = useState("");
  const [suggestText, setSuggestText] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      loadRecordData();
    }
  }, [recordId, employee]);

  const loadRecordData = async () => {
    try {
      const supabase = createBrowserSupabaseClient();

      // 載入評鑑記錄
      const { data: record, error: recordError } = await supabase
        .from("evaluation_records")
        .select("id, target_id, session_id, evaluation_sessions(name)")
        .eq("id", recordId)
        .single();

      if (recordError) throw recordError;

      if (record) {
        // 取得被評人姓名
        const { data: targetEmployee } = await supabase
          .from("employees")
          .select("name")
          .eq("id", record.target_id)
          .single();

        setTargetName(targetEmployee?.name || "未知");
        setSessionName((record as any).evaluation_sessions?.name || "");

        // 載入已填寫的分數
        const { data: existingScores } = await supabase
          .from("evaluation_scores")
          .select("dimension_code, score")
          .eq("record_id", recordId);

        if (existingScores) {
          const scoresMap: Record<string, number> = {};
          existingScores.forEach((s) => {
            scoresMap[s.dimension_code] = s.score;
          });
          setScores(scoresMap);
        }

        // 載入已填寫的評論
        const { data: comments } = await supabase
          .from("evaluation_comments")
          .select("positive_text, suggest_text")
          .eq("record_id", recordId)
          .single();

        if (comments) {
          setPositiveText(comments.positive_text || "");
          setSuggestText(comments.suggest_text || "");
        }
      }
    } catch (error) {
      console.error("載入資料失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;

    // 驗證所有維度都已評分
    const missingDimensions = DIMENSIONS.filter(
      (dim) => !scores[dim.code] || scores[dim.code] < 1 || scores[dim.code] > 5
    );

    if (missingDimensions.length > 0) {
      alert("請完成所有維度的評分（1-5分）");
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createBrowserSupabaseClient();

      // 儲存分數
      const scoresToInsert = DIMENSIONS.map((dim) => ({
        record_id: recordId,
        dimension_code: dim.code,
        score: scores[dim.code],
      }));

      // 先刪除舊的分數
      await supabase.from("evaluation_scores").delete().eq("record_id", recordId);

      // 插入新分數
      const { error: scoresError } = await supabase
        .from("evaluation_scores")
        .insert(scoresToInsert);

      if (scoresError) throw scoresError;

      // 儲存評論
      const { error: commentsError } = await supabase
        .from("evaluation_comments")
        .upsert({
          record_id: recordId,
          positive_text: positiveText || null,
          suggest_text: suggestText || null,
        });

      if (commentsError) throw commentsError;

      alert("評鑑已成功提交！");
      router.push("/dashboard");
    } catch (error: any) {
      alert("提交失敗: " + error.message);
    } finally {
      setSubmitting(false);
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
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← 返回
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {type === "self" ? "自評" : "評鑑"} - {targetName}
        </h1>
        <p className="text-gray-500 mt-1">{sessionName}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-6">
        {/* 評分維度 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">評分維度（1-5分）</h2>
          <div className="space-y-4">
            {DIMENSIONS.map((dim) => (
              <div key={dim.code} className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">{dim.label}</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setScores({ ...scores, [dim.code]: score })}
                      className={`w-10 h-10 rounded-lg border-2 transition-colors ${
                        scores[dim.code] === score
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-gray-300 text-gray-700 hover:border-blue-400"
                      }`}
                    >
                      {score}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 文字回饋 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">文字回饋</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                欣賞的地方（正向回饋）
              </label>
              <textarea
                value={positiveText}
                onChange={(e) => setPositiveText(e.target.value)}
                rows={4}
                placeholder="請分享你欣賞這位夥伴的地方..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                建議改善的地方
              </label>
              <textarea
                value={suggestText}
                onChange={(e) => setSuggestText(e.target.value)}
                rows={4}
                placeholder="請提供建設性的建議..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </section>

        {/* 提交按鈕 */}
        <div className="flex gap-3 pt-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "提交中..." : "提交評鑑"}
          </button>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}

