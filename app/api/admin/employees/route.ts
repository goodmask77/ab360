import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * 員工管理 API
 * GET: 取得所有員工
 * POST: 新增員工
 * PUT: 更新員工
 * DELETE: 刪除員工
 */

// 使用 service_role key 來繞過 RLS 政策
function getAdminSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// GET: 取得所有員工
export async function GET(req: NextRequest) {
  try {
    const supabase = getAdminSupabase();
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("name");

    if (error) {
      console.error("[API ERROR] get employees:", error);
      throw error;
    }

    return NextResponse.json({ success: true, data: data || [] });
  } catch (error: any) {
    console.error("[API ERROR] get employees:", error);
    return NextResponse.json(
      { error: error.message || "取得員工列表失敗" },
      { status: 500 }
    );
  }
}

// POST: 新增員工
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, role, department } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "姓名和 Email 為必填欄位" },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    // 先建立 Auth 使用者
    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: {},
    });

    if (createUserError || !newUser?.user) {
      console.error("[API ERROR] create auth user:", createUserError);
      return NextResponse.json(
        { error: "無法建立使用者帳號: " + (createUserError?.message || "未知錯誤") },
        { status: 500 }
      );
    }

    // 建立員工資料
    const { data: employee, error: createEmployeeError } = await supabase
      .from("employees")
      .insert({
        auth_user_id: newUser.user.id,
        name,
        email,
        role: role || "staff",
        department: department || "front",
      })
      .select()
      .single();

    if (createEmployeeError) {
      console.error("[API ERROR] create employee:", createEmployeeError);
      // 如果建立員工失敗，嘗試刪除已建立的 Auth 使用者
      await supabase.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json(
        { error: "無法建立員工資料: " + createEmployeeError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "員工已新增",
      data: employee,
    });
  } catch (error: any) {
    console.error("[API ERROR] create employee:", error);
    return NextResponse.json(
      { error: error.message || "新增員工失敗" },
      { status: 500 }
    );
  }
}

// PUT: 更新員工
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, name, email, role, department } = body;

    if (!id) {
      return NextResponse.json(
        { error: "員工 ID 為必填欄位" },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    // 取得員工資料以取得 auth_user_id
    const { data: existingEmployee, error: fetchError } = await supabase
      .from("employees")
      .select("auth_user_id, email")
      .eq("id", id)
      .single();

    if (fetchError || !existingEmployee) {
      return NextResponse.json(
        { error: "找不到該員工" },
        { status: 404 }
      );
    }

    // 如果 email 有變更，更新 Auth 使用者的 email
    if (email && email !== existingEmployee.email) {
      await supabase.auth.admin.updateUserById(existingEmployee.auth_user_id, {
        email,
      });
    }

    // 更新員工資料
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (department) updateData.department = department;

    const { data: updatedEmployee, error: updateError } = await supabase
      .from("employees")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("[API ERROR] update employee:", updateError);
      return NextResponse.json(
        { error: "無法更新員工資料: " + updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "員工資料已更新",
      data: updatedEmployee,
    });
  } catch (error: any) {
    console.error("[API ERROR] update employee:", error);
    return NextResponse.json(
      { error: error.message || "更新員工失敗" },
      { status: 500 }
    );
  }
}

// DELETE: 刪除員工
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "員工 ID 為必填欄位" },
        { status: 400 }
      );
    }

    const supabase = getAdminSupabase();

    // 取得員工資料以取得 auth_user_id
    const { data: employee, error: fetchError } = await supabase
      .from("employees")
      .select("auth_user_id")
      .eq("id", id)
      .single();

    if (fetchError || !employee) {
      return NextResponse.json(
        { error: "找不到該員工" },
        { status: 404 }
      );
    }

    // 在刪除員工前，先刪除所有相關的 evaluation_records
    // 這包括該員工作為 evaluator 或 target 的所有記錄
    const { error: deleteRecordsError } = await supabase
      .from("evaluation_records")
      .delete()
      .or(`evaluator_id.eq.${id},target_id.eq.${id}`);

    if (deleteRecordsError) {
      console.error("[API ERROR] delete evaluation records:", deleteRecordsError);
      // 繼續執行，因為可能沒有相關記錄
    }

    // 刪除相關的 evaluation_assignments（如果存在）
    const { error: deleteAssignmentsError } = await supabase
      .from("evaluation_assignments")
      .delete()
      .or(`evaluator_id.eq.${id},target_id.eq.${id}`);

    if (deleteAssignmentsError) {
      console.error("[API ERROR] delete evaluation assignments:", deleteAssignmentsError);
      // 繼續執行
    }

    // 刪除相關的 ai_feedback（如果存在）
    const { error: deleteAIFeedbackError } = await supabase
      .from("ai_feedback")
      .delete()
      .eq("target_id", id);

    if (deleteAIFeedbackError) {
      console.error("[API ERROR] delete ai feedback:", deleteAIFeedbackError);
      // 繼續執行
    }

    // 刪除相關的 reward_points_ledger（如果存在）
    const { error: deletePointsError } = await supabase
      .from("reward_points_ledger")
      .delete()
      .or(`giver_id.eq.${id},receiver_id.eq.${id}`);

    if (deletePointsError) {
      console.error("[API ERROR] delete reward points:", deletePointsError);
      // 繼續執行
    }

    // 刪除員工資料
    const { error: deleteEmployeeError } = await supabase
      .from("employees")
      .delete()
      .eq("id", id);

    if (deleteEmployeeError) {
      console.error("[API ERROR] delete employee:", deleteEmployeeError);
      return NextResponse.json(
        { error: "無法刪除員工資料: " + deleteEmployeeError.message },
        { status: 500 }
      );
    }

    // 刪除 Auth 使用者
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(
      employee.auth_user_id
    );

    if (deleteUserError) {
      console.error("[API ERROR] delete auth user:", deleteUserError);
      // 即使刪除 Auth 使用者失敗，也返回成功（因為員工資料已刪除）
    }

    return NextResponse.json({
      success: true,
      message: "員工已刪除",
    });
  } catch (error: any) {
    console.error("[API ERROR] delete employee:", error);
    return NextResponse.json(
      { error: error.message || "刪除員工失敗" },
      { status: 500 }
    );
  }
}

