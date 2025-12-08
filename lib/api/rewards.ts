import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

export interface RewardCategory {
  id: string;
  key: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface RewardPoint {
  id: string;
  session_id: string;
  giver_id: string;
  receiver_id: string;
  category_key: string;
  points: number;
  created_at: string;
}

export interface LeaderboardEntry {
  employee_id: string;
  employee_name: string;
  department: string;
  total_points: number;
  category_points: Record<string, number>;
}

/**
 * 取得所有啟用的積分類別
 */
export async function getRewardCategories(): Promise<RewardCategory[]> {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase
    .from("reward_categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) {
    console.error("[API ERROR] get reward categories:", error);
    throw error;
  }
  return data || [];
}

/**
 * 取得使用者在本期的剩餘投票點數
 */
export async function getUserRemainingQuota(
  sessionId: string,
  userId: string
): Promise<number> {
  const supabase = createBrowserSupabaseClient();

  // 取得場次設定
  const { data: session, error: sessionError } = await supabase
    .from("evaluation_sessions")
    .select("vote_quota_per_user")
    .eq("id", sessionId)
    .single();

  if (sessionError) {
    console.error("[API ERROR] get session quota:", sessionError);
    throw sessionError;
  }

  const quota = session?.vote_quota_per_user || 100;

  // 計算已使用的點數
  const { data: usedPoints, error: usedError } = await supabase
    .from("reward_points_ledger")
    .select("points")
    .eq("session_id", sessionId)
    .eq("giver_id", userId);

  if (usedError) {
    console.error("[API ERROR] get used points:", usedError);
    throw usedError;
  }

  const used = usedPoints?.reduce((sum, p) => sum + p.points, 0) || 0;
  return Math.max(0, quota - used);
}

/**
 * 送出積分投票
 */
export async function giveRewardPoints(input: {
  sessionId: string;
  giverId: string;
  receiverId: string;
  categoryKey: string;
  points: number;
}): Promise<RewardPoint> {
  const supabase = createBrowserSupabaseClient();

  // 檢查不能投給自己
  if (input.giverId === input.receiverId) {
    throw new Error("不能投給自己");
  }

  // 檢查點數範圍
  if (input.points < 5 || input.points > 30) {
    throw new Error("點數必須在 5 到 30 之間");
  }

  // 檢查剩餘點數
  const remaining = await getUserRemainingQuota(input.sessionId, input.giverId);
  if (remaining < input.points) {
    throw new Error(`剩餘點數不足，目前剩餘 ${remaining} 點`);
  }

  // 檢查場次狀態
  const { data: session, error: sessionError } = await supabase
    .from("evaluation_sessions")
    .select("status")
    .eq("id", input.sessionId)
    .single();

  if (sessionError) {
    console.error("[API ERROR] check session status:", sessionError);
    throw sessionError;
  }

  if (session?.status !== "open") {
    throw new Error("場次未開放，無法投票");
  }

  // 寫入投票記錄
  const { data, error } = await supabase
    .from("reward_points_ledger")
    .insert({
      session_id: input.sessionId,
      giver_id: input.giverId,
      receiver_id: input.receiverId,
      category_key: input.categoryKey,
      points: input.points,
    })
    .select()
    .single();

  if (error) {
    console.error("[API ERROR] give reward points:", error);
    throw error;
  }

  return data;
}

/**
 * 取得使用者送出的投票記錄
 */
export async function getUserGivenPoints(
  sessionId: string,
  userId: string
): Promise<
  Array<
    RewardPoint & {
      receiver_name: string;
      receiver_department: string;
      category_name: string;
    }
  >
> {
  const supabase = createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("reward_points_ledger")
    .select(
      `
      *,
      receiver:employees!reward_points_ledger_receiver_id_fkey(name, department),
      category:reward_categories!reward_points_ledger_category_key_fkey(name)
    `
    )
    .eq("session_id", sessionId)
    .eq("giver_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[API ERROR] get user given points:", error);
    throw error;
  }

  return (
    data?.map((item: any) => ({
      ...item,
      receiver_name: item.receiver?.name || "未知",
      receiver_department: item.receiver?.department || "",
      category_name: item.category?.name || "未知類別",
    })) || []
  );
}

/**
 * 取得使用者獲得的總積分
 */
export async function getUserReceivedPoints(
  sessionId: string,
  userId: string
): Promise<{ total: number; byCategory: Record<string, number> }> {
  const supabase = createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("reward_points_ledger")
    .select("points, category_key")
    .eq("session_id", sessionId)
    .eq("receiver_id", userId);

  if (error) {
    console.error("[API ERROR] get user received points:", error);
    throw error;
  }

  const total = data?.reduce((sum, p) => sum + p.points, 0) || 0;
  const byCategory: Record<string, number> = {};

  for (const item of data || []) {
    byCategory[item.category_key] =
      (byCategory[item.category_key] || 0) + item.points;
  }

  return { total, byCategory };
}

/**
 * 取得總排行榜
 */
export async function getLeaderboard(
  sessionId: string
): Promise<LeaderboardEntry[]> {
  const supabase = createBrowserSupabaseClient();

  // 使用 Supabase 查詢計算總積分
  const { data, error } = await supabase
    .from("reward_points_ledger")
    .select("receiver_id, points, category_key, employees!reward_points_ledger_receiver_id_fkey(id, name, department)")
    .eq("session_id", sessionId);

  if (error) {
    console.error("[API ERROR] get leaderboard:", error);
    throw error;
  }

  // 在記憶體中計算總分
  const pointsMap = new Map<
    string,
    {
      employee_id: string;
      employee_name: string;
      department: string;
      total_points: number;
      category_points: Record<string, number>;
    }
  >();

  for (const item of data || []) {
    const employee = (item as any).employees;
    if (!employee) continue;

    const empId = employee.id;
    if (!pointsMap.has(empId)) {
      pointsMap.set(empId, {
        employee_id: empId,
        employee_name: employee.name || "未知",
        department: employee.department || "",
        total_points: 0,
        category_points: {},
      });
    }

    const entry = pointsMap.get(empId)!;
    entry.total_points += item.points;
    entry.category_points[item.category_key] =
      (entry.category_points[item.category_key] || 0) + item.points;
  }

  return Array.from(pointsMap.values()).sort(
    (a, b) => b.total_points - a.total_points
  );
}

/**
 * 取得類別排行榜
 */
export async function getCategoryLeaderboard(
  sessionId: string,
  categoryKey: string
): Promise<LeaderboardEntry[]> {
  const supabase = createBrowserSupabaseClient();

  const { data, error } = await supabase
    .from("reward_points_ledger")
    .select("receiver_id, points, employees!reward_points_ledger_receiver_id_fkey(id, name, department)")
    .eq("session_id", sessionId)
    .eq("category_key", categoryKey);

  if (error) {
    console.error("[API ERROR] get category leaderboard:", error);
    throw error;
  }

  const pointsMap = new Map<
    string,
    {
      employee_id: string;
      employee_name: string;
      department: string;
      total_points: number;
      category_points: Record<string, number>;
    }
  >();

  for (const item of data || []) {
    const employee = (item as any).employees;
    if (!employee) continue;

    const empId = employee.id;
    if (!pointsMap.has(empId)) {
      pointsMap.set(empId, {
        employee_id: empId,
        employee_name: employee.name || "未知",
        department: employee.department || "",
        total_points: 0,
        category_points: { [categoryKey]: 0 },
      });
    }

    const entry = pointsMap.get(empId)!;
    entry.total_points += item.points;
    entry.category_points[categoryKey] =
      (entry.category_points[categoryKey] || 0) + item.points;
  }

  return Array.from(pointsMap.values()).sort(
    (a, b) => b.total_points - a.total_points
  );
}

/**
 * 取得所有員工列表（用於投票選擇）
 */
export async function getEmployeesForVoting(
  sessionId: string,
  excludeUserId: string
): Promise<Array<{ id: string; name: string; department: string }>> {
  const supabase = createBrowserSupabaseClient();

  // 取得有參與此場次的員工（有 assignment 的員工）
  const { data: assignments, error: assignmentsError } = await supabase
    .from("evaluation_assignments")
    .select("target_id")
    .eq("session_id", sessionId);

  if (assignmentsError) {
    console.error("[API ERROR] get assignments for voting:", assignmentsError);
    throw assignmentsError;
  }

  const employeeIds = [
    ...new Set(assignments?.map((a) => a.target_id) || []),
  ].filter((id) => id !== excludeUserId);

  if (employeeIds.length === 0) {
    return [];
  }

  const { data: employees, error: employeesError } = await supabase
    .from("employees")
    .select("id, name, department")
    .in("id", employeeIds)
    .order("name");

  if (employeesError) {
    console.error("[API ERROR] get employees for voting:", employeesError);
    throw employeesError;
  }

  return employees || [];
}


