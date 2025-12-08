import { createBrowserSupabaseClient } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

export interface Employee {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: "staff" | "manager" | "owner";
  department: string | null;
  created_at: string;
}

/**
 * 登入（Email + Password）
 */
export async function signIn(email: string, password: string) {
  const supabase = createBrowserSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("登入錯誤:", error);
    throw error;
  }

  // 返回完整的登入結果
  return {
    user: data.user,
    session: data.session,
    error: null,
  };
}

/**
 * 登出
 */
export async function signOut() {
  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * 取得當前使用者
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createBrowserSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * 取得當前使用者的員工資料
 */
export async function getCurrentEmployee(): Promise<Employee | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createBrowserSupabaseClient();
  // 使用 maybeSingle() 避免當沒有資料時拋出錯誤
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // PGRST116 表示沒有資料，這是正常的（員工資料可能尚未建立）
  if (error && error.code !== "PGRST116") {
    console.error("[API ERROR] get current employee:", error);
  }
  
  if (!data) return null;
  return data as Employee;
}

/**
 * 檢查使用者是否有管理員權限
 */
export async function isAdmin(): Promise<boolean> {
  const employee = await getCurrentEmployee();
  return employee?.role === "manager" || employee?.role === "owner";
}

/**
 * 檢查使用者是否有擁有者權限
 */
export async function isOwner(): Promise<boolean> {
  const employee = await getCurrentEmployee();
  return employee?.role === "owner";
}

