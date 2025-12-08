import { createClient, SupabaseClient } from "@supabase/supabase-js";

// 單例模式：確保整個應用只使用一個 Supabase Client 實例
let browserClient: SupabaseClient | null = null;

/**
 * 建立瀏覽器端 Supabase Client（用於 Client Components）
 * 使用單例模式，避免建立多個實例
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  // 如果已經存在，直接返回
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  // 建立並快取 client
  browserClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return browserClient;
}

/**
 * 建立伺服器端 Supabase Client（用於 Server Components / Server Actions）
 * 使用標準的 createClient，可配合 cookies 進行身份驗證
 */
export function createServerSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}

