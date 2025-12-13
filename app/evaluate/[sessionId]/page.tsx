"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { getSessionById, type EvaluationSession } from "@/lib/api/sessions";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Card from "@/components/Card";

interface Employee {
  id: string;
  name: string;
  department: string | null;
  email: string;
}

export default function EvaluationTypeSelectionPage() {
  const params = useParams();
  const router = useRouter();
  const { employee, loading } = useSession();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
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
      const [sessionData, { data: employeesData, error: employeesError }] = await Promise.all([
        getSessionById(sessionId),
        supabase
          .from("employees")
          .select("id, name, department, email")
          .neq("id", employee?.id || ""), // 排除自己
      ]);

      if (employeesError) {
        console.error("[API ERROR] get employees:", employeesError);
      }

      setSession(sessionData);
      setAllEmployees(employeesData || []);
    } catch (error) {
      console.error("[API ERROR] load evaluation type selection data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const handleSelfEvaluation = () => {
    router.push(`/evaluate/${sessionId}/self`);
  };

  const handlePeerEvaluation = (targetId: string) => {
    router.push(`/evaluate/${sessionId}/peer/${targetId}`);
  };

  return (
    <AuthGuard requireAuth={true}>
      <MobileLayout
        title={session?.name || "評鑑"}
        showHomeButton={true}
        onBack={() => router.push("/home")}
      >
        {loadingData ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        ) : !session ? (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">找不到評鑑場次</div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 場次資訊卡片 */}
            <Card className="p-4">
              <div className="text-lg font-semibold text-foreground mb-2">
                {session.name}
              </div>
              <div className="text-sm text-muted">
                {formatDate(session.start_at)} ~ {formatDate(session.end_at)}
              </div>
            </Card>

            {/* 選擇評鑑類型 */}
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-4">選擇評鑑類型</h2>

              {/* 自評選項 */}
              <Card
                className="p-4 mb-4 cursor-pointer card-hover"
                onClick={handleSelfEvaluation}
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">📝</div>
                  <div className="flex-1">
                    <div className="text-lg font-semibold text-foreground mb-1">自評</div>
                    <div className="text-sm text-muted">評鑑自己的表現</div>
                  </div>
                  <div className="text-muted">→</div>
                </div>
              </Card>

              {/* 互評選項 */}
              <div>
                <h3 className="text-base font-medium text-foreground mb-3">互評夥伴</h3>
                {allEmployees.length === 0 ? (
                  <Card className="p-4">
                    <div className="text-center text-muted">
                      目前沒有其他夥伴可以評鑑
                    </div>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {allEmployees.map((emp) => (
                      <Card
                        key={emp.id}
                        className="p-4 cursor-pointer card-hover"
                        onClick={() => handlePeerEvaluation(emp.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-action/20 flex items-center justify-center text-action font-semibold">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-foreground">{emp.name}</div>
                              <div className="text-sm text-muted">
                                {emp.department === "front"
                                  ? "外場"
                                  : emp.department === "back"
                                  ? "內場"
                                  : emp.department || "未設定"}
                              </div>
                            </div>
                          </div>
                          <div className="text-muted">→</div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </MobileLayout>
    </AuthGuard>
  );
}
