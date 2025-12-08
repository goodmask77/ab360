"use client";

import { createContext, useContext, useEffect, useState } from "react";
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

  const refresh = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("取得使用者失敗:", userError);
        setUser(null);
        setEmployee(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      if (currentUser) {
        const { data: emp, error: empError } = await supabase
          .from("employees")
          .select("*")
          .eq("auth_user_id", currentUser.id)
          .single();

        if (empError) {
          console.error("查詢員工資料失敗:", empError);
          // 如果查詢失敗，可能是 RLS 政策問題或員工資料不存在
          // 但仍然設定 loading 為 false，讓使用者可以看到錯誤訊息
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
    refresh();

    const supabase = createBrowserSupabaseClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      refresh();
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

