import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    const supabase = createServerSupabaseClient();

    // 取得所有員工
    const { data: employees, error: employeesError } = await supabase
      .from("employees")
      .select("id, department");

    if (employeesError) throw employeesError;

    if (!employees || employees.length === 0) {
      return NextResponse.json(
        { error: "沒有員工資料" },
        { status: 400 }
      );
    }

    // 檢查是否已有 assignments
    const { data: existingAssignments } = await supabase
      .from("evaluation_assignments")
      .select("id")
      .eq("session_id", sessionId)
      .limit(1);

    if (existingAssignments && existingAssignments.length > 0) {
      return NextResponse.json(
        { error: "此場次已有分配記錄，請先清除現有分配" },
        { status: 400 }
      );
    }

    const assignments: Array<{
      session_id: string;
      evaluator_id: string;
      target_id: string;
      is_self: boolean;
      status: string;
    }> = [];

    // 為每位員工建立自評
    for (const employee of employees) {
      assignments.push({
        session_id: sessionId,
        evaluator_id: employee.id,
        target_id: employee.id,
        is_self: true,
        status: "pending",
      });
    }

    // 為每位員工建立同部門互評
    for (const employee of employees) {
      const sameDeptEmployees = employees.filter(
        (e) => e.id !== employee.id && e.department === employee.department
      );

      for (const peer of sameDeptEmployees) {
        assignments.push({
          session_id: sessionId,
          evaluator_id: employee.id,
          target_id: peer.id,
          is_self: false,
          status: "pending",
        });
      }
    }

    // 批次插入
    const { error: insertError } = await supabase
      .from("evaluation_assignments")
      .insert(assignments);

    if (insertError) throw insertError;

    return NextResponse.json({
      success: true,
      count: assignments.length,
    });
  } catch (error: any) {
    console.error("產生分配失敗:", error);
    return NextResponse.json(
      { error: error.message || "產生分配失敗" },
      { status: 500 }
    );
  }
}

