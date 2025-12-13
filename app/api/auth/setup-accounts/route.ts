import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * 設定帳號權限 API
 * - goodmask77@gmail.com → 測試員工 (staff)
 * - gooodmask77@gmail.com → 最高權限管理員 (owner)
 */
export async function POST(request: NextRequest) {
  try {
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

    const results = [];

    // 1. 設定 goodmask77@gmail.com 為測試員工 (staff)
    const staffEmail = "goodmask77@gmail.com";
    const staffResult = await setupAccount(supabase, {
      email: staffEmail,
      name: "測試員工",
      role: "staff",
      department: "front",
    });
    results.push(staffResult);

    // 2. 設定 gooodmask77@gmail.com 為最高權限管理員 (owner)
    const adminEmail = "gooodmask77@gmail.com";
    const adminResult = await setupAccount(supabase, {
      email: adminEmail,
      name: "系統管理員",
      role: "owner",
      department: "management",
    });
    results.push(adminResult);

    return NextResponse.json({
      success: true,
      message: "帳號設定完成",
      results,
    });
  } catch (error: any) {
    console.error("[API ERROR] 設定帳號錯誤:", error);
    return NextResponse.json(
      { error: error.message || "設定失敗" },
      { status: 500 }
    );
  }
}

/**
 * 設定單一帳號的輔助函數
 */
async function setupAccount(
  supabase: any,
  config: {
    email: string;
    name: string;
    role: "staff" | "duty" | "owner";
    department: string;
  }
) {
  const { email, name, role, department } = config;

  // 檢查 Auth 使用者是否存在
  const { data: usersList } = await supabase.auth.admin.listUsers();
  const existingUser = usersList?.users?.find((u: any) => u.email === email);

  let userId: string;

  if (existingUser) {
    userId = existingUser.id;
    console.log(`使用者 ${email} 已存在，ID: ${userId}`);
  } else {
    // 建立新使用者
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {},
    });

    if (createError || !newUser?.user) {
      console.error(`[API ERROR] 建立使用者 ${email} 失敗:`, createError);
      throw new Error(`無法建立使用者帳號 ${email}: ${createError?.message}`);
    }

    userId = newUser.user.id;
    console.log(`已建立新使用者 ${email}，ID: ${userId}`);
  }

  // 檢查員工資料是否存在
  const { data: existingEmployee } = await supabase
    .from("employees")
    .select("*")
    .eq("auth_user_id", userId)
    .maybeSingle();

  if (existingEmployee) {
    // 更新現有員工資料
    const { error: updateError } = await supabase
      .from("employees")
      .update({
        name,
        email,
        role,
        department,
      })
      .eq("auth_user_id", userId);

    if (updateError) {
      console.error(`[API ERROR] 更新員工資料 ${email} 失敗:`, updateError);
      throw new Error(`無法更新員工資料 ${email}: ${updateError.message}`);
    }

    console.log(`已更新員工資料 ${email} → ${role}`);
    return {
      email,
      action: "updated",
      role,
      userId,
    };
  } else {
    // 建立新員工資料
    const { error: insertError } = await supabase.from("employees").insert({
      auth_user_id: userId,
      name,
      email,
      role,
      department,
    });

    if (insertError) {
      console.error(`[API ERROR] 建立員工資料 ${email} 失敗:`, insertError);
      throw new Error(`無法建立員工資料 ${email}: ${insertError.message}`);
    }

    console.log(`已建立員工資料 ${email} → ${role}`);
    return {
      email,
      action: "created",
      role,
      userId,
    };
  }
}

