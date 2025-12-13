import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * 不需要密碼的登入 API
 * 只需要 email，系統會自動建立或使用現有帳號，並直接建立 session
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email 是必填欄位" },
        { status: 400 }
      );
    }

    // 使用 service_role key 來建立 session
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[API ERROR] Missing Supabase environment variables");
      return NextResponse.json(
        { error: "伺服器設定錯誤" },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 檢查使用者是否存在
    const { data: usersList } = await supabase.auth.admin.listUsers();
    const existingUser = usersList?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      // 使用者已存在
      userId = existingUser.id;
    } else {
      // 建立新使用者（不需要密碼，自動確認）
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {},
      });

      if (createError || !newUser?.user) {
        console.error("[API ERROR] 建立使用者失敗:", createError);
        return NextResponse.json(
          { error: "無法建立使用者帳號" },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
    }

    // 使用 admin API 建立 magic link，然後從中提取 token
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError || !linkData) {
      console.error("[API ERROR] 建立 magic link 失敗:", linkError);
      return NextResponse.json(
        { error: "無法建立登入連結" },
        { status: 500 }
      );
    }

    // 從 magic link URL 中提取 token
    const actionLink = linkData.properties?.action_link;
    if (!actionLink) {
      return NextResponse.json(
        { error: "無法取得登入連結" },
        { status: 500 }
      );
    }

    // 解析 URL 取得 token
    const url = new URL(actionLink);
    const hash = url.hash.substring(1); // 移除 #
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken) {
      // 如果無法從 URL 取得，嘗試使用 properties
      return NextResponse.json({
        success: true,
        user: {
          id: userId,
          email,
        },
        actionLink,
        // 讓前端使用 magic link 來完成登入
        useMagicLink: true,
      });
    }

    // 返回 session 資訊
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email,
      },
      accessToken,
      refreshToken,
      actionLink,
    });
  } catch (error: any) {
    console.error("[API ERROR] 登入錯誤:", error);
    return NextResponse.json(
      { error: error.message || "登入失敗" },
      { status: 500 }
    );
  }
}

