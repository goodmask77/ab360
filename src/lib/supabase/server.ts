import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "./types";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieOptions = Partial<Omit<Parameters<CookieStore["set"]>[0], "name" | "value">>;

export async function supabaseServer() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase server env vars");
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions = {}) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string) {
        cookieStore.delete(name);
      },
    },
  });
}
