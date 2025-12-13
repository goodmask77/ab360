import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * 初始化管理員帳號 API
 * 為 goodmask77@gmail.com 建立或更新為 owner 角色
 */
export async function POST(request: NextRequest) {
  try {
    const email = "goodmask77@gmail.com";

    // 使用 service_role key
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

    // 檢查 Auth 使用者是否存在
    const { data: usersList } = await supabase.auth.admin.listUsers();
    const existingUser = usersList?.users?.find(u => u.email === email);

    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // 建立新使用者
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

    // 檢查員工資料是否存在
    const { data: existingEmployee } = await supabase
      .from("employees")
      .select("*")
      .eq("auth_user_id", userId)
      .maybeSingle();

    if (existingEmployee) {
      // 更新為 owner 角色
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          role: "owner",
          name: "系統管理員",
          email: email,
        })
        .eq("auth_user_id", userId);

      if (updateError) {
        console.error("[API ERROR] 更新員工資料失敗:", updateError);
        return NextResponse.json(
          { error: "無法更新員工資料" },
          { status: 500 }
        );
      }
    } else {
      // 建立新員工資料
      const { error: insertError } = await supabase
        .from("employees")
        .insert({
          auth_user_id: userId,
          name: "系統管理員",
          email: email,
          role: "owner",
          department: "management",
        });

      if (insertError) {
        console.error("[API ERROR] 建立員工資料失敗:", insertError);
        return NextResponse.json(
          { error: "無法建立員工資料" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "管理員帳號已初始化",
      email,
      role: "owner",
    });
  } catch (error: any) {
    console.error("[API ERROR] 初始化管理員帳號錯誤:", error);
    return NextResponse.json(
      { error: error.message || "初始化失敗" },
      { status: 500 }
    );
  }
}

