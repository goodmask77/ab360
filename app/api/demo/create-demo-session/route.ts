import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // 建立 Demo 場次
    const { data: session, error: sessionError } = await supabase
      .from("evaluation_sessions")
      .insert({
        name: "2025/04 月度 360 Demo",
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        status: "open",
      })
      .select()
      .single();

    if (sessionError) {
      console.error("[API ERROR] create demo session:", sessionError);
      throw sessionError;
    }

    // 建立預設10道題目
    const defaultQuestions = [
      {
        category: "出勤與守時",
        order_index: 1,
        question_text: "這位夥伴上班準時，願意支援臨時調班，出勤狀況穩定。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "工作態度",
        order_index: 2,
        question_text: "遇到麻煩的客人或突發狀況時，這位夥伴仍能保持專業與冷靜，積極解決問題。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "團隊合作",
        order_index: 3,
        question_text: "在忙碌時願意主動幫助同事，互相 cover，讓團隊運作更順暢。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "溝通與回報",
        order_index: 4,
        question_text: "能清楚傳遞資訊，遇到問題會主動回報，不會隱瞞或拖延。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "學習與成長",
        order_index: 5,
        question_text: "願意學新東西，接受指正並調整做法，持續進步。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "服務細節",
        order_index: 6,
        question_text: "點餐、送餐、收桌等細節是否到位，能關注客人需求。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "front",
      },
      {
        category: "出餐品質",
        order_index: 7,
        question_text: "餐點品質穩定、擺盤與出餐速度符合標準。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "back",
      },
      {
        category: "衛生與安全",
        order_index: 8,
        question_text: "在衛生、安全規範上的遵守程度，能維護工作環境的整潔與安全。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "責任感",
        order_index: 9,
        question_text: "對自己負責的工作有「做完／做好」的意識，不會敷衍了事。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "綜合印象與建議",
        order_index: 10,
        question_text: "給這位夥伴一句具體的鼓勵或建議，幫助他一起變強。",
        type: "text",
        target_type: "both",
        for_department: "all",
      },
    ];

    const questionsToInsert = defaultQuestions.map((q) => ({
      ...q,
      session_id: session.id,
    }));

    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (questionsError) {
      console.error("[API ERROR] create default questions:", questionsError);
      // 不拋出錯誤，場次已建立，題目可以之後手動新增
    }

    return NextResponse.json({
      success: true,
      session,
      questionsCreated: !questionsError,
      message: questionsError
        ? "Demo 場次已建立，但題目建立失敗，請手動新增題目"
        : "Demo 場次和10道預設題目已建立",
    });
  } catch (error: any) {
    console.error("[API ERROR] create demo session:", error);
    return NextResponse.json(
      { error: error.message || "建立失敗" },
      { status: 500 }
    );
  }
}


