import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Supabase Auth Callback 路由
 * 處理 magic link 回調，從 URL hash 中提取 token 並重定向
 * 
 * 注意：Supabase magic link 會在 URL hash 中包含 access_token 和 refresh_token
 * 前端 Supabase client 會自動檢測並處理這些 token（因為配置了 detectSessionInUrl: true）
 * 這個路由主要是為了清理 URL 並重定向到正確的頁面
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next") || "/home";

  // 檢查 URL hash 中是否有 token（Supabase magic link 會在 hash 中包含 token）
  const hash = requestUrl.hash.substring(1); // 移除 #
  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const error = params.get("error");
  const errorDescription = params.get("error_description");

  if (error) {
    // 如果有錯誤，重定向到登入頁並顯示錯誤訊息
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }

  if (accessToken) {
    // 有 token，重定向到首頁（前端會自動處理 session）
    // 我們將 token 保留在 URL 中，讓前端的 Supabase client 自動檢測
    const redirectUrl = new URL(next, requestUrl.origin);
    redirectUrl.hash = hash; // 保留 hash 讓前端處理
    return NextResponse.redirect(redirectUrl);
  }

  // 如果沒有 token，直接重定向到首頁
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

