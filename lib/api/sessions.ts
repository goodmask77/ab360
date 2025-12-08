import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

export interface EvaluationSession {
  id: string;
  name: string;
  start_at: string | null;
  end_at: string | null;
  status: "draft" | "open" | "closed";
  created_at: string;
}

export interface CreateSessionInput {
  name: string;
  start_at?: string;
  end_at?: string;
  status?: "draft" | "open" | "closed";
}

export interface UpdateSessionInput {
  name?: string;
  start_at?: string | null;
  end_at?: string | null;
  status?: "draft" | "open" | "closed";
}

/**
 * 取得所有評鑑場次
 */
export async function getAllSessions(): Promise<EvaluationSession[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("evaluation_sessions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * 取得單一場次
 */
export async function getSessionById(id: string): Promise<EvaluationSession | null> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("evaluation_sessions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

/**
 * 建立新場次
 */
export async function createSession(input: CreateSessionInput): Promise<EvaluationSession> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("evaluation_sessions")
    .insert({
      name: input.name,
      start_at: input.start_at || null,
      end_at: input.end_at || null,
      status: input.status || "draft",
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 更新場次
 */
export async function updateSession(
  id: string,
  input: UpdateSessionInput
): Promise<EvaluationSession> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("evaluation_sessions")
    .update({
      ...(input.name !== undefined && { name: input.name }),
      ...(input.start_at !== undefined && { start_at: input.start_at || null }),
      ...(input.end_at !== undefined && { end_at: input.end_at || null }),
      ...(input.status !== undefined && { status: input.status }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * 計算場次完成度
 */
export async function getSessionCompletion(sessionId: string): Promise<{
  total: number;
  completed: number;
  percentage: number;
}> {
  const supabase = createBrowserSupabaseClient();

  // 取得所有 assignments
  const { data: assignments, error } = await supabase
    .from("evaluation_assignments")
    .select("status")
    .eq("session_id", sessionId);

  if (error) throw error;

  const total = assignments?.length || 0;
  const completed = assignments?.filter((a) => a.status === "completed").length || 0;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, percentage };
}

