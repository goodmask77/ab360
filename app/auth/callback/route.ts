import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Supabase Auth Callback 路由
 * 處理 magic link 回調，交換 token 並建立 session
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = requestUrl.searchParams.get("next") || "/home";

  if (token_hash && type) {
    const supabase = createRouteHandlerClient({ cookies });

    const { error } = await supabase.auth.verifyOtp({
      type: type as any,
      token_hash,
    });

    if (!error) {
      // 驗證成功，重定向到首頁
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  // 如果驗證失敗或參數不完整，重定向到登入頁
  return NextResponse.redirect(new URL("/login?error=auth_failed", requestUrl.origin));
}

