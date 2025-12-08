import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabaseClient";

export async function POST(req: NextRequest) {
  try {
    const { sessionId, targetId } = await req.json();

    if (!sessionId || !targetId) {
      return NextResponse.json({ error: "缺少必要參數" }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // 取得評分資料
    const { data: records } = await supabase
      .from("evaluation_records")
      .select("id, type")
      .eq("session_id", sessionId)
      .eq("target_id", targetId);

    if (!records || records.length === 0) {
      return NextResponse.json({
        strengths: [],
        improvements: [],
        suggestions: "目前還沒有足夠的評分資料來產生建議。",
      });
    }

    // 取得答案
    const recordIds = records.map((r) => r.id);
    const { data: answers } = await supabase
      .from("evaluation_answers")
      .select("answer_value, questions(category, question_text)")
      .in("record_id", recordIds);

    // 計算各分類平均分數
    const categoryScores: Record<
      string,
      { scores: number[]; question: string }
    > = {};

    for (const answer of answers || []) {
      const question = (answer as any).questions;
      if (!question) continue;

      const score = parseInt(answer.answer_value);
      if (isNaN(score)) continue;

      const category = question.category;
      if (!categoryScores[category]) {
        categoryScores[category] = { scores: [], question: question.question_text };
      }
      categoryScores[category].scores.push(score);
    }

    // 產生建議（基於分數規則）
    const strengths: string[] = [];
    const improvements: string[] = [];

    for (const [category, data] of Object.entries(categoryScores)) {
      const avg = data.scores.reduce((a, b) => a + b, 0) / data.scores.length;

      if (avg >= 4.5) {
        strengths.push(`你在「${category}」表現很突出，夥伴們都給予高度評價。`);
      } else if (avg <= 3.5) {
        improvements.push(
          `在「${category}」稍微落後平均，可以嘗試多練習或尋求協助。`
        );
      }
    }

    // 如果沒有特別的優勢或改進點，給一般建議
    if (strengths.length === 0 && improvements.length === 0) {
      strengths.push("整體表現穩定，持續保持！");
      improvements.push("可以嘗試在團隊合作上更主動一些。");
    }

    const suggestions =
      strengths.length > 0 && improvements.length > 0
        ? "整體表現良好，建議持續保持優勢並在改進點上多加練習，一起變強！"
        : strengths.length > 0
        ? "表現優秀，繼續保持並幫助其他夥伴一起成長！"
        : "還有進步空間，持續努力，相信你會越來越好！";

    return NextResponse.json({
      strengths,
      improvements,
      suggestions,
    });
  } catch (error: any) {
    console.error("[API ERROR] generate AI summary:", error);
    return NextResponse.json(
      { error: error.message || "生成失敗" },
      { status: 500 }
    );
  }
}


