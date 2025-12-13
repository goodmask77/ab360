import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

export interface EvaluationAnswer {
  question_id: string;
  answer_value: string;
}

export interface SubmitEvaluationInput {
  session_id: string;
  target_id: string;
  is_self: boolean;
  is_named: boolean;
  answers: EvaluationAnswer[];
}

/**
 * 提交評鑑
 */
export async function submitEvaluation(input: SubmitEvaluationInput): Promise<void> {
  const supabase = createBrowserSupabaseClient();

  // 取得當前使用者
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("未登入");

  // 取得員工 ID
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("id")
    .eq("auth_user_id", user.id)
    .single();

  if (employeeError) {
    console.error("[API ERROR] get employee:", employeeError);
    throw employeeError;
  }

  if (!employee) throw new Error("找不到員工資料");

  const evaluator_id = employee.id;

  // 檢查是否已有記錄
  const { data: existingRecord, error: existingRecordError } = await supabase
    .from("evaluation_records")
    .select("id")
    .eq("session_id", input.session_id)
    .eq("evaluator_id", evaluator_id)
    .eq("target_id", input.target_id)
    .single();

  // 忽略 "PGRST116" 錯誤（找不到記錄），這是正常的
  if (existingRecordError && existingRecordError.code !== "PGRST116") {
    console.error("[API ERROR] check existing evaluation record:", existingRecordError);
    throw existingRecordError;
  }

  let recordId: string;

  if (existingRecord) {
    // 更新現有記錄
    recordId = existingRecord.id;
  } else {
    // 建立新記錄
    const { data: newRecord, error: recordError } = await supabase
      .from("evaluation_records")
      .insert({
        session_id: input.session_id,
        evaluator_id,
        target_id: input.target_id,
        type: input.is_self ? "self" : "peer",
        is_named: input.is_named,
      })
      .select()
      .single();

    if (recordError) {
      console.error("[API ERROR] create evaluation record:", recordError);
      throw recordError;
    }
    recordId = newRecord.id;
  }

  // 刪除舊答案
  const { error: deleteError } = await supabase
    .from("evaluation_answers")
    .delete()
    .eq("record_id", recordId);

  if (deleteError) {
    console.error("[API ERROR] delete evaluation answers:", deleteError);
    throw deleteError;
  }

  // 插入新答案
  if (input.answers.length > 0) {
    const { error: answersError } = await supabase
      .from("evaluation_answers")
      .insert(
        input.answers.map((answer) => ({
          record_id: recordId,
          question_id: answer.question_id,
          answer_value: answer.answer_value,
        }))
      )
      .select();

    if (answersError) {
      console.error("[API ERROR] insert evaluation answers:", answersError);
      throw answersError;
    }
  }

  // 更新或創建 assignment 狀態
  // 先檢查是否存在 assignment
  const { data: existingAssignment, error: checkAssignmentError } = await supabase
    .from("evaluation_assignments")
    .select("id")
    .eq("session_id", input.session_id)
    .eq("evaluator_id", evaluator_id)
    .eq("target_id", input.target_id)
    .eq("is_self", input.is_self)
    .maybeSingle();

  if (checkAssignmentError && checkAssignmentError.code !== "PGRST116") {
    console.error("[API ERROR] check evaluation assignment:", checkAssignmentError);
  }

  if (existingAssignment) {
    // 更新現有 assignment
    const { error: assignmentError } = await supabase
      .from("evaluation_assignments")
      .update({
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .eq("id", existingAssignment.id)
      .select();

    if (assignmentError) {
      console.error("[API ERROR] update evaluation assignment:", assignmentError);
      // 不拋出錯誤，因為評鑑記錄已經建立
    }
  } else {
    // 創建新的 assignment（允許動態互評）
    const { error: createAssignmentError } = await supabase
      .from("evaluation_assignments")
      .insert({
        session_id: input.session_id,
        evaluator_id,
        target_id: input.target_id,
        is_self: input.is_self,
        status: "completed",
        completed_at: new Date().toISOString(),
      })
      .select();

    if (createAssignmentError) {
      console.error("[API ERROR] create evaluation assignment:", createAssignmentError);
      // 不拋出錯誤，因為評鑑記錄已經建立
    }
  }
}

