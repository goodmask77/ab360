import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  generateRandomName,
  generateRandomEmail,
  generateRandomComment,
  generateRandomScore,
  generateRandomPoints,
  generateRandomCategory,
} from "@/lib/demoData";

/**
 * 生成完整的虛擬數據
 * 包含：50位員工、3個評鑑場次、完整的評鑑記錄、積分投票、AI回饋
 */
export async function POST(req: NextRequest) {
  try {
    // 使用 service_role key 來繞過 RLS 政策
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

    // 1. 建立 50 位虛擬員工（包含不同角色和 Auth 使用者）
    const createdEmployees: Array<{ id: string; name: string; department: string; role: string }> = [];

    // 生成 50 位員工
    for (let i = 1; i <= 50; i++) {
      let role = "staff";
      if (i === 1) role = "owner"; // 第1位是老闆
      else if (i <= 5) role = "duty"; // 第2-5位是 Duty

      const name = generateRandomName();
      const email = generateRandomEmail(i);
      const department = Math.random() > 0.5 ? "front" : "back";

      // 先建立 Auth 使用者
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {},
      });

      if (createUserError || !newUser?.user) {
        console.error(`[API ERROR] create auth user ${email}:`, createUserError);
        continue; // 跳過這個員工，繼續下一個
      }

      // 建立員工資料
      const { data: employee, error: createEmployeeError } = await supabase
        .from("employees")
        .insert({
          auth_user_id: newUser.user.id,
          name,
          email,
          department,
          role,
        })
        .select("id, name, department, role")
        .single();

      if (createEmployeeError) {
        console.error(`[API ERROR] create employee ${email}:`, createEmployeeError);
        // 如果建立員工失敗，刪除已建立的 Auth 使用者
        await supabase.auth.admin.deleteUser(newUser.user.id);
        continue;
      }

      if (employee) {
        createdEmployees.push(employee);
      }
    }

    if (createdEmployees.length === 0) {
      throw new Error("無法建立員工資料");
    }

    const staffEmployees = createdEmployees.filter((e) => e.role === "staff");
    const allEmployees = createdEmployees;

    // 2. 建立 3 個評鑑場次（過去、現在、未來）
    const sessions = [
      {
        name: "2024 Q4 季度評鑑",
        status: "closed" as const,
        start_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        end_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        reward_pool_points: 2000,
        vote_quota_per_user: 150,
      },
      {
        name: "2025 Q1 季度評鑑",
        status: "open" as const,
        start_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reward_pool_points: 2500,
        vote_quota_per_user: 200,
      },
      {
        name: "2025 Q2 季度評鑑（預告）",
        status: "draft" as const,
        start_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        end_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        reward_pool_points: 2500,
        vote_quota_per_user: 200,
      },
    ];

    const createdSessions: Array<{ id: string; name: string; status: string }> = [];

    for (const sessionData of sessions) {
      const { data: session, error: sessionError } = await supabase
        .from("evaluation_sessions")
        .insert(sessionData)
        .select()
        .single();

      if (sessionError) {
        console.error("[API ERROR] create session:", sessionError);
        continue;
      }

      if (session) {
        createdSessions.push(session);
      }
    }

    if (createdSessions.length === 0) {
      throw new Error("無法建立評鑑場次");
    }

    const openSession = createdSessions.find((s) => s.status === "open");
    if (!openSession) {
      throw new Error("無法找到進行中的評鑑場次");
    }

    // 3. 為每個場次建立預設題目
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

    // 為每個場次建立題目
    for (const session of createdSessions) {
      const questionsToInsert = defaultQuestions.map((q) => ({
        ...q,
        session_id: session.id,
      }));

      await supabase.from("questions").insert(questionsToInsert).select();
    }

    // 4. 為進行中的場次建立完整的 assignments 和 records
    let totalAssignments = 0;
    let totalRecords = 0;
    let totalPoints = 0;

    for (const session of createdSessions) {
      const assignments: Array<{
        session_id: string;
        evaluator_id: string;
        target_id: string;
        is_self: boolean;
        status: string;
      }> = [];

      // 為每位員工建立自評和互評
      for (const emp of allEmployees) {
        // 自評
        assignments.push({
          session_id: session.id,
          evaluator_id: emp.id,
          target_id: emp.id,
          is_self: true,
          status: session.status === "closed" ? "completed" : Math.random() > 0.2 ? "completed" : "pending",
        });

        // 同部門互評（每位員工評 3-5 位同部門同事）
        const sameDeptEmployees = allEmployees.filter(
          (e) => e.id !== emp.id && e.department === emp.department
        );
        const shuffled = sameDeptEmployees.sort(() => Math.random() - 0.5);
        const peersToEvaluate = shuffled.slice(0, Math.min(5, Math.floor(Math.random() * 3) + 3));

        for (const peer of peersToEvaluate) {
          assignments.push({
            session_id: session.id,
            evaluator_id: emp.id,
            target_id: peer.id,
            is_self: false,
            status:
              session.status === "closed"
                ? "completed"
                : Math.random() > 0.4
                ? "completed"
                : "pending",
          });
        }
      }

      const { error: assignmentsError } = await supabase
        .from("evaluation_assignments")
        .insert(assignments)
        .select();

      if (assignmentsError) {
        console.error("[API ERROR] create assignments:", assignmentsError);
      } else {
        totalAssignments += assignments.length;
      }

      // 為已完成的 assignments 建立 evaluation_records
      const completedAssignments = assignments.filter(
        (a) => a.status === "completed" && !a.is_self
      );

      // 取得題目
      const { data: questions } = await supabase
        .from("questions")
        .select("id, type")
        .eq("session_id", session.id)
        .order("order_index");

      // 為每個完成的互評建立記錄
      for (const assignment of completedAssignments) {
        const { data: record, error: recordError } = await supabase
          .from("evaluation_records")
          .insert({
            session_id: session.id,
            evaluator_id: assignment.evaluator_id,
            target_id: assignment.target_id,
            type: "peer",
            is_named: Math.random() > 0.3,
          })
          .select()
          .single();

        if (recordError || !record) {
          continue;
        }

        totalRecords++;

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
          positive_text: Math.random() > 0.2 ? generateRandomComment() : null,
          suggest_text: Math.random() > 0.3 ? generateRandomComment() : null,
        });

        // 為部分記錄建立 AI 回饋
        if (Math.random() > 0.5 && session.status === "closed") {
          await supabase.from("ai_feedback").insert({
            record_id: record.id,
            summary_text: generateRandomComment() + "。整體表現值得肯定，建議繼續保持並在細節上持續精進。",
            strengths: "工作態度積極、團隊合作良好",
            improvements: "可以加強時間管理和細節處理",
          });
        }
      }

      // 5. 為進行中和已結束的場次建立積分投票記錄
      if (session.status === "open" || session.status === "closed") {
        const pointRecords: Array<{
          session_id: string;
          giver_id: string;
          receiver_id: string;
          category_key: string;
          points: number;
        }> = [];

        // 每位員工送出 5-10 筆積分投票
        for (const giver of allEmployees) {
          const numVotes = Math.floor(Math.random() * 6) + 5; // 5-10 筆
          const receivers = allEmployees.filter((e) => e.id !== giver.id);
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

        const { error: pointsError } = await supabase
          .from("reward_points_ledger")
          .insert(pointRecords)
          .select();

        if (pointsError) {
          console.error("[API ERROR] create reward points:", pointsError);
        } else {
          totalPoints += pointRecords.length;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "已成功建立完整虛擬數據！",
      data: {
        employees_count: createdEmployees.length,
        sessions_count: createdSessions.length,
        sessions: createdSessions.map((s) => ({ id: s.id, name: s.name, status: s.status })),
        assignments_count: totalAssignments,
        records_count: totalRecords,
        points_count: totalPoints,
      },
    });
  } catch (error: any) {
    console.error("[API ERROR] create full demo data:", error);
    return NextResponse.json(
      { error: error.message || "建立失敗" },
      { status: 500 }
    );
  }
}

