"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/lib/hooks/useSession";
import { getSessionById, type EvaluationSession } from "@/lib/api/sessions";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";

export default function EvaluationTypePage() {
  const params = useParams();
  const router = useRouter();
  const { employee, loading } = useSession();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [peerTargets, setPeerTargets] = useState<Array<{
    id: string;
    name: string;
    department: string;
  }>>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && employee) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, employee, loading]);

  const loadData = async () => {
    try {
      const supabase = createBrowserSupabaseClient();
      
      // 取得場次資訊
      const sessionData = await getSessionById(sessionId);
      setSession(sessionData);

      // 取得該用戶的互評任務（同部門的夥伴）
      const { data: assignments } = await supabase
        .from("evaluation_assignments")
        .select("target_id")
        .eq("session_id", sessionId)
        .eq("evaluator_id", employee!.id)
        .eq("is_self", false)
        .eq("status", "pending");

      if (assignments && assignments.length > 0) {
        // 取得所有目標員工資訊
        const targetIds = assignments.map(a => a.target_id);
        const { data: targets } = await supabase
          .from("employees")
          .select("id, name, department")
          .in("id", targetIds);

        setPeerTargets(targets || []);
      } else {
        // 如果沒有 assignments，自動建立自評 assignment
        const { data: existingSelfAssignment } = await supabase
          .from("evaluation_assignments")
          .select("id")
          .eq("session_id", sessionId)
          .eq("evaluator_id", employee!.id)
          .eq("target_id", employee!.id)
          .eq("is_self", true)
          .maybeSingle();

        if (!existingSelfAssignment) {
          await supabase
            .from("evaluation_assignments")
            .insert({
              session_id: sessionId,
              evaluator_id: employee!.id,
              target_id: employee!.id,
              is_self: true,
              status: "pending",
            });
        }
      }
    } catch (error) {
      console.error("[API ERROR] load evaluation type data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  if (loading || loadingData) {
    return (
      <MobileLayout title="選擇評鑑類型">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">載入中...</div>
        </div>
      </MobileLayout>
    );
  }

  if (!session) {
    return (
      <MobileLayout title="選擇評鑑類型">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">場次不存在</div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <MobileLayout
        title={session.name}
        showBackButton={true}
        onBack={() => router.push("/home")}
      >
        <div className="space-y-6">
          {/* 場次資訊 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
            <h2 className="font-semibold text-gray-900 mb-1">{session.name}</h2>
            {session.start_at && session.end_at && (
              <p className="text-sm text-gray-600">
                {new Date(session.start_at).toLocaleDateString("zh-TW")} ~{" "}
                {new Date(session.end_at).toLocaleDateString("zh-TW")}
              </p>
            )}
          </div>

          {/* 選擇評鑑類型 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">選擇評鑑類型</h3>

            {/* 自評選項 */}
            <Link
              href={`/evaluate/${sessionId}/self`}
              className="block bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">📝</span>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">自評</h4>
                      <p className="text-sm text-gray-600">評鑑自己的表現</p>
                    </div>
                  </div>
                </div>
                <span className="text-2xl">→</span>
              </div>
            </Link>

            {/* 互評選項 */}
            {peerTargets.length > 0 ? (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🤝</span>
                  <span>互評 - 選擇夥伴</span>
                </h4>
                <div className="space-y-3">
                  {peerTargets.map((target) => (
                    <Link
                      key={target.id}
                      href={`/evaluate/${sessionId}/peer/${target.id}`}
                      className="block bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-lg transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h5 className="font-bold text-gray-900 text-lg mb-1">
                            {target.name}
                          </h5>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-800 rounded">
                              {target.department === "front"
                                ? "外場"
                                : target.department === "back"
                                ? "內場"
                                : target.department}
                            </span>
                            <span className="text-xs text-gray-500">互評</span>
                          </div>
                        </div>
                        <span className="text-2xl">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🤝</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-700 mb-1">互評</h4>
                    <p className="text-sm text-gray-500">
                      目前沒有待評鑑的夥伴，或所有互評任務已完成
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MobileLayout>
    </AuthGuard>
  );
}

