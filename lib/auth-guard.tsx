"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

/**
 * AuthGuard 元件
 * 處理路由保護邏輯
 */
export function AuthGuard({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo,
}: AuthGuardProps) {
  const { user, employee, loading, isAdmin } = useSession();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    if (loading) return;
    
    // 重置重定向標記（當狀態改變時）
    if (hasRedirectedRef.current && user) {
      hasRedirectedRef.current = false;
    }

    // 需要登入但未登入
    if (requireAuth && !user && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push(redirectTo || "/login");
      return;
    }

    // 需要管理員權限但非管理員
    if (requireAdmin && (!isAdmin || !employee) && !hasRedirectedRef.current) {
      hasRedirectedRef.current = true;
      router.push(redirectTo || "/home");
      return;
    }
  }, [user, employee, loading, isAdmin, requireAuth, requireAdmin, redirectTo, router]);

  // 載入中顯示載入畫面
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  // 需要登入但未登入，不渲染內容
  if (requireAuth && !user) {
    return null;
  }

  // 需要管理員但非管理員，不渲染內容
  if (requireAdmin && (!isAdmin || !employee)) {
    return null;
  }

  return <>{children}</>;
}

