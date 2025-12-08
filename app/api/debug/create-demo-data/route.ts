import { createServerSupabaseClient } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import {
  generateRandomName,
  generateRandomEmail,
  generateRandomComment,
  generateRandomScore,
  generateRandomPoints,
  generateRandomCategory,
} from "@/lib/demoData";

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // 生成隨機 session 名稱
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const sessionName = `2025 / Demo 360 評鑑 #${randomCode}`;

    // 1. 建立 20 位虛擬員工
    const employees: Array<{ name: string; email: string; department: string; role: string }> = [];
    for (let i = 1; i <= 20; i++) {
      employees.push({
        name: generateRandomName(),
        email: generateRandomEmail(i),
        department: Math.random() > 0.5 ? "front" : "back",
        role: "staff",
      });
    }

    const { data: createdEmployees, error: employeesError } = await supabase
      .from("employees")
      .insert(employees)
      .select("id, name, department");

    if (employeesError) {
      console.error("[API ERROR] create employees:", employeesError);
      throw employeesError;
    }

    if (!createdEmployees || createdEmployees.length === 0) {
      throw new Error("無法建立員工資料");
    }

    // 2. 建立評鑑場次
    const { data: session, error: sessionError } = await supabase
      .from("evaluation_sessions")
      .insert({
        name: sessionName,
        status: "open",
        start_at: new Date().toISOString(),
        end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reward_pool_points: 1000,
        vote_quota_per_user: 100,
      })
      .select()
      .single();

    if (sessionError) {
      console.error("[API ERROR] create session:", sessionError);
      throw sessionError;
    }

    // 3. 建立預設 10 道題目
    const defaultQuestions = [
      {
        category: "出勤與守時",
        order_index: 1,
        question_text: "這位夥伴上班準時，願意支援臨時調班，出勤狀況穩定。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "工作態度",
        order_index: 2,
        question_text: "遇到麻煩的客人或突發狀況時，這位夥伴仍能保持專業與冷靜，積極解決問題。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "團隊合作",
        order_index: 3,
        question_text: "在忙碌時願意主動幫助同事，互相 cover，讓團隊運作更順暢。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "溝通與回報",
        order_index: 4,
        question_text: "能清楚傳遞資訊，遇到問題會主動回報，不會隱瞞或拖延。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "學習與成長",
        order_index: 5,
        question_text: "願意學新東西，接受指正並調整做法，持續進步。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "服務細節",
        order_index: 6,
        question_text: "點餐、送餐、收桌等細節是否到位，能關注客人需求。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "front",
      },
      {
        category: "出餐品質",
        order_index: 7,
        question_text: "餐點品質穩定、擺盤與出餐速度符合標準。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "back",
      },
      {
        category: "衛生與安全",
        order_index: 8,
        question_text: "在衛生、安全規範上的遵守程度，能維護工作環境的整潔與安全。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "責任感",
        order_index: 9,
        question_text: "對自己負責的工作有「做完／做好」的意識，不會敷衍了事。",
        type: "scale_1_5",
        target_type: "both",
        for_department: "all",
      },
      {
        category: "綜合印象與建議",
        order_index: 10,
        question_text: "給這位夥伴一句具體的鼓勵或建議，幫助他一起變強。",
        type: "text",
        target_type: "both",
        for_department: "all",
      },
    ];

    const questionsToInsert = defaultQuestions.map((q) => ({
      ...q,
      session_id: session.id,
    }));

    const { error: questionsError } = await supabase
      .from("questions")
      .insert(questionsToInsert)
      .select();

    if (questionsError) {
      console.error("[API ERROR] create questions:", questionsError);
      // 不拋出錯誤，繼續執行
    }

    // 4. 建立 assignments（自評 + 同部門互評）
    const assignments: Array<{
      session_id: string;
      evaluator_id: string;
      target_id: string;
      is_self: boolean;
      status: string;
    }> = [];

    for (const emp of createdEmployees) {
      // 自評
      assignments.push({
        session_id: session.id,
        evaluator_id: emp.id,
        target_id: emp.id,
        is_self: true,
        status: "completed",
      });

      // 同部門互評
      const sameDeptEmployees = createdEmployees.filter(
        (e) => e.id !== emp.id && e.department === emp.department
      );
      for (const peer of sameDeptEmployees) {
        assignments.push({
          session_id: session.id,
          evaluator_id: emp.id,
          target_id: peer.id,
          is_self: false,
          status: Math.random() > 0.3 ? "completed" : "pending",
        });
      }
    }

    const { error: assignmentsError } = await supabase
      .from("evaluation_assignments")
      .insert(assignments)
      .select();

    if (assignmentsError) {
      console.error("[API ERROR] create assignments:", assignmentsError);
      // 不拋出錯誤，繼續執行
    }

    // 5. 建立 evaluation_records 和 answers（20 筆評鑑記錄）
    const completedAssignments = assignments.filter((a) => a.status === "completed" && !a.is_self);
    const recordsToCreate = completedAssignments.slice(0, 20); // 只建立 20 筆

    // 取得題目
    const { data: questions } = await supabase
      .from("questions")
      .select("id, type")
      .eq("session_id", session.id)
      .order("order_index");

    for (const assignment of recordsToCreate) {
      // 建立 evaluation_record
      const { data: record, error: recordError } = await supabase
        .from("evaluation_records")
        .insert({
          session_id: session.id,
          evaluator_id: assignment.evaluator_id,
          target_id: assignment.target_id,
          type: "peer",
          is_named: Math.random() > 0.5,
        })
        .select()
        .single();

      if (recordError) {
        console.error("[API ERROR] create record:", recordError);
        continue;
      }

      // 為每道題目建立答案
      for (const question of questions || []) {
        if (question.type === "scale_1_5") {
          const score = generateRandomScore();
          await supabase.from("evaluation_answers").insert({
            record_id: record.id,
            question_id: question.id,
            answer_value: score.toString(),
          });
        } else {
          const comment = generateRandomComment();
          await supabase.from("evaluation_answers").insert({
            record_id: record.id,
            question_id: question.id,
            answer_value: comment,
          });
        }
      }

      // 建立文字回饋
      await supabase.from("evaluation_comments").insert({
        record_id: record.id,
        positive_text: Math.random() > 0.3 ? generateRandomComment() : null,
        suggest_text: Math.random() > 0.5 ? generateRandomComment() : null,
      });
    }

    // 6. 建立積分投票記錄（20-50 筆）
    const pointRecords: Array<{
      session_id: string;
      giver_id: string;
      receiver_id: string;
      category_key: string;
      points: number;
    }> = [];

    // 確保每個員工至少送出一些積分
    for (const giver of createdEmployees) {
      const numVotes = Math.floor(Math.random() * 3) + 1; // 1-3 筆
      const receivers = createdEmployees.filter((e) => e.id !== giver.id);
      
      // 隨機選擇接收者
      const shuffled = receivers.sort(() => Math.random() - 0.5);
      for (let i = 0; i < Math.min(numVotes, shuffled.length); i++) {
        pointRecords.push({
          session_id: session.id,
          giver_id: giver.id,
          receiver_id: shuffled[i].id,
          category_key: generateRandomCategory(),
          points: generateRandomPoints(),
        });
      }
    }

    // 限制總數在 20-50 筆
    const finalPointRecords = pointRecords.slice(0, Math.min(50, Math.max(20, pointRecords.length)));

    const { error: pointsError } = await supabase
      .from("reward_points_ledger")
      .insert(finalPointRecords)
      .select();

    if (pointsError) {
      console.error("[API ERROR] create reward points:", pointsError);
      // 不拋出錯誤，繼續執行
    }

    return NextResponse.json({
      success: true,
      message: "已成功建立測試資料！",
      data: {
        employees_count: createdEmployees.length,
        session_id: session.id,
        session_name: session.name,
        assignments_count: assignments.length,
        records_count: recordsToCreate.length,
        points_count: finalPointRecords.length,
      },
    });
  } catch (error: any) {
    console.error("[API ERROR] create demo data:", error);
    return NextResponse.json(
      { error: error.message || "建立失敗" },
      { status: 500 }
    );
  }
}

