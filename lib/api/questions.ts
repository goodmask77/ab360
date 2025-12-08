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

  if (error) throw error;
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

  if (error) throw error;
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

  if (error) throw error;
  return data;
}

/**
 * 刪除題目
 */
export async function deleteQuestion(id: string): Promise<void> {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.from("questions").delete().eq("id", id);

  if (error) throw error;
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

    if (error) throw error;
  }
}

