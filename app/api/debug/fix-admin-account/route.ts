import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

/**
 * 修復管理員帳號 API
 * 使用現有的 manager@ab360.com 或建立新的 admin@ab360.test
 */
export async function POST(req: NextRequest) {
  try {
    // 使用 Service Role Key（需要從環境變數取得）
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "缺少 SUPABASE_SERVICE_ROLE_KEY 環境變數" },
        { status: 500 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "缺少 NEXT_PUBLIC_SUPABASE_URL 環境變數" },
        { status: 500 }
      );
    }

    // 建立 Admin Client
    const { createClient } = await import("@supabase/supabase-js");
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 1. 列出所有用戶
    const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error("[API ERROR] list users:", listError);
      return NextResponse.json(
        { error: "無法列出用戶: " + listError.message },
        { status: 500 }
      );
    }

    // 2. 優先使用 manager@ab360.com
    let targetEmail = "manager@ab360.com";
    let targetPassword = "admin123";
    let targetUserId: string | null = null;

    const managerUser = usersData.users.find((u) => u.email === "manager@ab360.com");

    if (managerUser) {
      targetUserId = managerUser.id;
      console.log("✅ 找到 manager@ab360.com，使用此帳號");
    } else {
      // 3. 如果沒有 manager@ab360.com，嘗試建立 admin@ab360.test
      targetEmail = "admin@ab360.test";
      targetPassword = "Admin123!";

      const existingAdmin = usersData.users.find((u) => u.email === targetEmail);

      if (existingAdmin) {
        targetUserId = existingAdmin.id;
        console.log("✅ 找到 admin@ab360.test，使用此帳號");
      } else {
        // 建立新用戶
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: targetEmail,
          password: targetPassword,
          email_confirm: true,
        });

        if (createError) {
          console.error("[API ERROR] create user:", createError);
          return NextResponse.json(
            { error: "建立用戶失敗: " + createError.message },
            { status: 500 }
          );
        }

        targetUserId = newUser.user.id;
        console.log("✅ 已建立新用戶:", targetEmail);
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: "無法取得或建立用戶 ID" }, { status: 500 });
    }

    // 4. 更新密碼
    const { error: updatePasswordError } = await supabaseAdmin.auth.admin.updateUserById(
      targetUserId,
      { password: targetPassword }
    );

    if (updatePasswordError) {
      console.warn("[API WARN] update password:", updatePasswordError);
      // 不阻擋流程，繼續執行
    } else {
      console.log("✅ 密碼已更新");
    }

    // 5. 建立或更新員工記錄為 owner
    const { data: employee, error: employeeError } = await supabaseAdmin
      .from("employees")
      .upsert(
        {
          auth_user_id: targetUserId,
          name: "系統管理員",
          email: targetEmail,
          role: "owner",
          department: "front",
        },
        {
          onConflict: "auth_user_id",
        }
      )
      .select()
      .single();

    if (employeeError) {
      console.error("[API ERROR] upsert employee:", employeeError);
      return NextResponse.json(
        { error: "建立員工記錄失敗: " + employeeError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "管理員帳號已修復！",
      data: {
        email: targetEmail,
        password: targetPassword,
        role: "owner",
        employee_id: employee.id,
      },
    });
  } catch (error: any) {
    console.error("[API ERROR] fix admin account:", error);
    return NextResponse.json(
      { error: error.message || "修復失敗" },
      { status: 500 }
    );
  }
}

