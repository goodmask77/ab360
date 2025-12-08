import { createBrowserSupabaseClient } from "@/lib/supabaseClient";

export interface FeedbackSummary {
  session_id: string;
  session_name: string;
  self_average: number;
  peer_average: number;
  total_evaluators: number;
  category_scores: {
    category: string;
    self_score: number;
    peer_score: number;
  }[];
}

export interface FeedbackDetail {
  question_id: string;
  question_text: string;
  category: string;
  self_answer: string | null;
  peer_answers: Array<{
    answer_value: string;
    is_named: boolean;
    evaluator_name?: string;
  }>;
  peer_average: number;
}

/**
 * 取得使用者的回饋摘要（所有場次）
 */
export async function getUserFeedbackSummaries(
  userId: string
): Promise<FeedbackSummary[]> {
  const supabase = createBrowserSupabaseClient();

  // 取得使用者作為 target 的所有場次
  const { data: records, error: recordsError } = await supabase
    .from("evaluation_records")
    .select("session_id, evaluation_sessions(name, status)")
    .eq("target_id", userId);

  if (recordsError) {
    console.error("[API ERROR] get user feedback summaries:", recordsError);
    throw recordsError;
  }

  const summaries: FeedbackSummary[] = [];
  const sessionMap = new Map<string, any>();

  for (const record of records || []) {
    const sessionId = record.session_id;
    if (sessionMap.has(sessionId)) continue;

    const session = (record as any).evaluation_sessions;
    if (session?.status !== "open" && session?.status !== "closed") continue;

    // 取得該場次的所有記錄
    const { data: sessionRecords } = await supabase
      .from("evaluation_records")
      .select("id, type, is_named")
      .eq("session_id", sessionId)
      .eq("target_id", userId);

    if (!sessionRecords || sessionRecords.length === 0) continue;

    // 取得所有答案
    const recordIds = sessionRecords.map((r) => r.id);
    const { data: answers } = await supabase
      .from("evaluation_answers")
      .select("record_id, question_id, answer_value, questions(category, question_text)")
      .in("record_id", recordIds);

    // 計算分數
    const selfRecord = sessionRecords.find((r) => r.type === "self");
    const peerRecords = sessionRecords.filter((r) => r.type === "peer");

    let selfAverage = 0;
    let peerAverage = 0;
    const categoryScoresMap = new Map<string, { self: number[]; peer: number[] }>();

    for (const answer of answers || []) {
      const question = (answer as any).questions;
      if (!question) continue;

      const score = parseInt(answer.answer_value);
      if (isNaN(score)) continue;

      const category = question.category;
      if (!categoryScoresMap.has(category)) {
        categoryScoresMap.set(category, { self: [], peer: [] });
      }

      const categoryData = categoryScoresMap.get(category)!;

      if (selfRecord && answer.record_id === selfRecord.id) {
        categoryData.self.push(score);
      } else if (peerRecords.some((r) => r.id === answer.record_id)) {
        categoryData.peer.push(score);
      }
    }

    // 計算平均
    const categoryScores: FeedbackSummary["category_scores"] = [];
    for (const [category, scores] of categoryScoresMap.entries()) {
      const selfScore =
        scores.self.length > 0
          ? scores.self.reduce((a, b) => a + b, 0) / scores.self.length
          : 0;
      const peerScore =
        scores.peer.length > 0
          ? scores.peer.reduce((a, b) => a + b, 0) / scores.peer.length
          : 0;

      if (selfScore > 0 || peerScore > 0) {
        categoryScores.push({ category, self_score: selfScore, peer_score: peerScore });
        selfAverage += selfScore;
        peerAverage += peerScore;
      }
    }

    if (categoryScores.length > 0) {
      selfAverage /= categoryScores.length;
      peerAverage /= categoryScores.length;
    }

    summaries.push({
      session_id: sessionId,
      session_name: session?.name || "未知場次",
      self_average: Math.round(selfAverage * 10) / 10,
      peer_average: Math.round(peerAverage * 10) / 10,
      total_evaluators: peerRecords.length,
      category_scores: categoryScores,
    });

    sessionMap.set(sessionId, true);
  }

  return summaries;
}

/**
 * 取得單一場次的詳細回饋
 */
export async function getSessionFeedbackDetail(
  sessionId: string,
  targetId: string
): Promise<FeedbackDetail[]> {
  const supabase = createBrowserSupabaseClient();

  // 取得所有記錄
  const { data: records } = await supabase
    .from("evaluation_records")
    .select("id, type, is_named, evaluator_id, employees(name)")
    .eq("session_id", sessionId)
    .eq("target_id", targetId);

  if (!records || records.length === 0) return [];

  const selfRecord = records.find((r) => r.type === "self");
  const peerRecords = records.filter((r) => r.type === "peer");

  // 取得所有答案
  const recordIds = records.map((r) => r.id);
  const { data: answers } = await supabase
    .from("evaluation_answers")
    .select("record_id, question_id, answer_value, questions(id, question_text, category)")
    .in("record_id", recordIds);

  // 依題目分組
  const questionMap = new Map<string, FeedbackDetail>();

  for (const answer of answers || []) {
    const question = (answer as any).questions;
    if (!question) continue;

    if (!questionMap.has(question.id)) {
      questionMap.set(question.id, {
        question_id: question.id,
        question_text: question.question_text,
        category: question.category,
        self_answer: null,
        peer_answers: [],
        peer_average: 0,
      });
    }

    const detail = questionMap.get(question.id)!;
    const score = parseInt(answer.answer_value);

    if (selfRecord && answer.record_id === selfRecord.id) {
      detail.self_answer = answer.answer_value;
    } else if (peerRecords.some((r) => r.id === answer.record_id)) {
      const peerRecord = peerRecords.find((r) => r.id === answer.record_id);
      detail.peer_answers.push({
        answer_value: answer.answer_value,
        is_named: peerRecord?.is_named || false,
        evaluator_name: peerRecord?.is_named
          ? ((peerRecord as any).employees?.name || "未知")
          : undefined,
      });

      if (!isNaN(score)) {
        const scores = detail.peer_answers
          .map((a) => parseInt(a.answer_value))
          .filter((s) => !isNaN(s));
        detail.peer_average =
          scores.length > 0
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0;
      }
    }
  }

  return Array.from(questionMap.values());
}

