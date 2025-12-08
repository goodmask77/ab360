"use client";

import { createContext, useContext, useEffect, useState, useRef } from "react";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import type { Employee } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  employee: null,
  loading: true,
  refresh: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const supabaseRef = useRef(createBrowserSupabaseClient());
  const initializedRef = useRef(false);

  const refresh = async () => {
    try {
      const supabase = supabaseRef.current;
      
      // 先檢查 session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session 錯誤:", sessionError);
        setUser(null);
        setEmployee(null);
        setLoading(false);
        return;
      }

      if (!session) {
        // 沒有 session，使用者未登入
        setUser(null);
        setEmployee(null);
        setLoading(false);
        return;
      }

      // 使用 session 中的 user，避免再次請求
      const currentUser = session.user;
      setUser(currentUser);

      if (currentUser) {
        // 使用 maybeSingle() 避免當沒有資料時拋出錯誤
        const { data: emp, error: empError } = await supabase
          .from("employees")
          .select("*")
          .eq("auth_user_id", currentUser.id)
          .maybeSingle();

        if (empError) {
          // 只有非 PGRST116 錯誤才記錄（PGRST116 表示沒有資料，這是正常的）
          if (empError.code !== "PGRST116") {
            console.error("查詢員工資料失敗:", empError);
            console.error("錯誤詳情:", JSON.stringify(empError, null, 2));
          }
          setEmployee(null);
        } else {
          setEmployee(emp as Employee | null);
        }
      } else {
        setEmployee(null);
      }
    } catch (error) {
      console.error("Auth refresh 錯誤:", error);
      setUser(null);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 只初始化一次
    if (initializedRef.current) return;
    initializedRef.current = true;

    const supabase = supabaseRef.current;

    // 初始載入
    refresh();

    // 監聽認證狀態變化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "TOKEN_REFRESHED") {
        refresh();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, employee, loading, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

