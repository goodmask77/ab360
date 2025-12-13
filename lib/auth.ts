import { createBrowserSupabaseClient } from "./supabaseClient";
import type { User } from "@supabase/supabase-js";

export interface Employee {
  id: string;
  auth_user_id: string;
  name: string;
  email: string;
  role: "staff" | "duty" | "owner";
  department: string | null;
  created_at: string;
}

/**
 * 登入（只需要 Email，不需要密碼）
 */
export async function signIn(email: string) {
  try {
    // 呼叫後端 API 來建立 session
    const response = await fetch("/api/auth/login-without-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || "登入失敗");
    }

    // 使用返回的 token 來設定 session
    const supabase = createBrowserSupabaseClient();
    
    if (result.useMagicLink && result.actionLink) {
      // 如果使用 magic link，直接導向
      window.location.href = result.actionLink;
      return {
        user: null,
        session: null,
        error: null,
      };
    } else if (result.accessToken) {
      // 使用 access token 來設定 session
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token: result.accessToken,
        refresh_token: result.refreshToken || "",
      });

      if (sessionError) {
        console.error("設定 session 錯誤:", sessionError);
        throw sessionError;
      }

      return {
        user: sessionData.user,
        session: sessionData.session,
        error: null,
      };
    } else {
      // 如果沒有 token，嘗試使用 magic link
      throw new Error("無法取得登入 token");
    }
  } catch (error: any) {
    console.error("登入錯誤:", error);
    throw error;
  }
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
 * 檢查使用者是否有管理員權限（只有 owner 是管理員）
 */
export async function isAdmin(): Promise<boolean> {
  const employee = await getCurrentEmployee();
  return employee?.role === "owner";
}

/**
 * 檢查使用者是否有擁有者權限
 */
export async function isOwner(): Promise<boolean> {
  const employee = await getCurrentEmployee();
  return employee?.role === "owner";
}

