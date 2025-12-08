import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

export interface Question {
  id: string;
  session_id: string;
  category: string;
  order_index: number;
  question_text: string;
  type: "scale_1_5" | "text";
  target_type: "self" | "peer" | "both";
  for_department: "front" | "back" | "all" | null;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionInput {
  session_id: string;
  category: string;
  order_index: number;
  question_text: string;
  type: "scale_1_5" | "text";
  target_type: "self" | "peer" | "both";
  for_department?: "front" | "back" | "all" | null;
}

export interface UpdateQuestionInput {
  category?: string;
  order_index?: number;
  question_text?: string;
  type?: "scale_1_5" | "text";
  target_type?: "self" | "peer" | "both";
  for_department?: "front" | "back" | "all" | null;
}

/**
 * 取得場次的所有題目
 */
export async function getQuestionsBySession(sessionId: string): Promise<Question[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("session_id", sessionId)
    .order("order_index", { ascending: true });

  if (error) {
    console.error("[API ERROR] get questions by session:", error);
    throw error;
  }
  return data || [];
}

/**
 * 建立新題目
 */
export async function createQuestion(input: CreateQuestionInput): Promise<Question> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .insert({
      session_id: input.session_id,
      category: input.category,
      order_index: input.order_index,
      question_text: input.question_text,
      type: input.type,
      target_type: input.target_type,
      for_department: input.for_department || "all",
    })
    .select()
    .single();

  if (error) {
    console.error("[API ERROR] create question:", error);
    throw error;
  }
  return data;
}

/**
 * 更新題目
 */
export async function updateQuestion(
  id: string,
  input: UpdateQuestionInput
): Promise<Question> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("questions")
    .update({
      ...(input.category !== undefined && { category: input.category }),
      ...(input.order_index !== undefined && { order_index: input.order_index }),
      ...(input.question_text !== undefined && { question_text: input.question_text }),
      ...(input.type !== undefined && { type: input.type }),
      ...(input.target_type !== undefined && { target_type: input.target_type }),
      ...(input.for_department !== undefined && { for_department: input.for_department }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[API ERROR] update question:", error);
    throw error;
  }
  return data;
}

/**
 * 刪除題目
 */
export async function deleteQuestion(id: string): Promise<void> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase
    .from("questions")
    .delete()
    .eq("id", id)
    .select();

  if (error) {
    console.error("[API ERROR] delete question:", error);
    throw error;
  }
}

/**
 * 調整題目順序
 */
export async function reorderQuestions(
  sessionId: string,
  questionIds: string[]
): Promise<void> {
  const supabase = createBrowserSupabaseClient();

  // 批次更新 order_index
  for (let i = 0; i < questionIds.length; i++) {
    const { error } = await supabase
      .from("questions")
      .update({ order_index: i + 1 })
      .eq("id", questionIds[i]);

    if (error) {
      console.error("[API ERROR] reorder questions:", error);
      throw error;
    }
  }
}

/**
 * 建立預設10道題目（用於快速建立場次）
 */
export async function createDefaultQuestions(sessionId: string): Promise<Question[]> {
  const defaultQuestions: Omit<CreateQuestionInput, "session_id">[] = [
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

  const createdQuestions: Question[] = [];
  for (const question of defaultQuestions) {
    try {
      const created = await createQuestion({ ...question, session_id: sessionId });
      createdQuestions.push(created);
    } catch (error) {
      console.error(`[API ERROR] create default question ${question.order_index}:`, error);
    }
  }

  return createdQuestions;
}
