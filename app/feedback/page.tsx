"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";

interface FeedbackSession {
  id: string;
  name: string;
  status: string;
  average_score: number;
  evaluator_count: number;
}

export default function FeedbackPage() {
  const { employee, loading } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<FeedbackSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    if (!loading && employee) {
      loadSessions();
    } else if (!loading && !employee) {
      router.push("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, loading]);

  const loadSessions = async () => {
    if (!employee) return;

    try {
      const supabase = createBrowserSupabaseClient();

      // 取得已結束或已啟用查看的場次
      const { data: closedSessions } = await supabase
        .from("evaluation_sessions")
        .select("id, name, status")
        .in("status", ["closed", "open"]);

      const sessionsWithFeedback: FeedbackSession[] = [];

      for (const session of closedSessions || []) {
        // 查詢該場次中，使用者作為 target 的記錄
        const { data: records } = await supabase
          .from("evaluation_records")
          .select("id")
          .eq("session_id", session.id)
          .eq("target_id", employee.id);

        if (records && records.length > 0) {
          // 計算平均分數
          const { data: answers } = await supabase
            .from("evaluation_answers")
            .select("answer_value")
            .in(
              "record_id",
              records.map((r) => r.id)
            );

          const scores = answers
            ?.filter((a) => !isNaN(Number(a.answer_value)))
            .map((a) => Number(a.answer_value)) || [];

          const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

          sessionsWithFeedback.push({
            id: session.id,
            name: session.name,
            status: session.status,
            average_score: Math.round(average * 10) / 10,
            evaluator_count: records.length,
          });
        }
      }

      setSessions(sessionsWithFeedback);
    } catch (error) {
      console.error("載入回饋失敗:", error);
    } finally {
      setLoadingSessions(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      {loading || loadingSessions ? (
        <MobileLayout title="我的回饋">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title="我的回饋">
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-500">目前沒有可查看的回饋</p>
              </div>
            ) : (
              sessions.map((session) => (
                <Link
                  key={session.id}
                  href={`/feedback/${session.id}`}
                  className="block bg-white rounded-lg shadow-sm p-4 border border-gray-200 hover:border-blue-300 hover:shadow transition-all"
                >
                  <h3 className="font-semibold text-gray-900 mb-2">{session.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">平均分數</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {session.average_score.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">評價人數</span>
                    <span className="text-gray-900">{session.evaluator_count} 人</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </MobileLayout>
      )}
    </AuthGuard>
  );
}

