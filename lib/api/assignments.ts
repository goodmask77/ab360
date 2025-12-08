import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

export interface EvaluationAssignment {
  id: string;
  session_id: string;
  evaluator_id: string;
  target_id: string;
  is_self: boolean;
  status: "pending" | "completed";
  completed_at: string | null;
  created_at: string;
}

/**
 * 取得使用者的所有 assignments
 */
export async function getUserAssignments(
  userId: string,
  sessionId?: string
): Promise<EvaluationAssignment[]> {
  const supabase = createBrowserSupabaseClient();
  let query = supabase
    .from("evaluation_assignments")
    .select("*")
    .eq("evaluator_id", userId);

  if (sessionId) {
    query = query.eq("session_id", sessionId);
  }

  const { data, error } = await query.order("created_at", { ascending: false });

  if (error) {
    console.error("[API ERROR] get user assignments:", error);
    throw error;
  }
  return data || [];
}

/**
 * 取得場次的所有 assignments
 */
export async function getSessionAssignments(
  sessionId: string
): Promise<EvaluationAssignment[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("evaluation_assignments")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API ERROR] get session assignments:", error);
    throw error;
  }
  return data || [];
}

/**
 * 更新 assignment 狀態
 */
export async function updateAssignmentStatus(
  id: string,
  status: "pending" | "completed"
): Promise<EvaluationAssignment> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("evaluation_assignments")
    .update({
      status,
      completed_at: status === "completed" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[API ERROR] update assignment status:", error);
    throw error;
  }
  return data;
}

