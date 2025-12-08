"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { getSessionById, updateSession, type EvaluationSession } from "@/lib/api/sessions";
import MobileLayout from "@/components/MobileLayout";
import Tabs from "@/components/Tabs";
import { AuthGuard } from "@/lib/auth-guard";
import SessionSettingsTab from "./settings-tab";
import SessionQuestionsTab from "./questions-tab";
import SessionAssignmentsTab from "./assignments-tab";

export default function SessionManagePage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, loading: authLoading } = useSession();
  const sessionId = params.id as string;
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push("/home");
    } else if (!authLoading && isAdmin) {
      loadSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, isAdmin, authLoading]);

  const loadSession = async () => {
    try {
      const data = await getSessionById(sessionId);
      setSession(data);
    } catch (error) {
      console.error("載入場次失敗:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSession = async (updates: Partial<EvaluationSession>) => {
    if (!session) return;

    try {
      const updated = await updateSession(sessionId, updates as any);
      setSession(updated);
    } catch (error) {
      console.error("更新場次失敗:", error);
      throw error;
    }
  };

  if (loading || authLoading) {
    return (
      <AuthGuard requireAuth={true} requireAdmin={true}>
        <MobileLayout title="場次管理">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        </MobileLayout>
      </AuthGuard>
    );
  }

  if (!session) {
    return (
      <AuthGuard requireAuth={true} requireAdmin={true}>
        <MobileLayout title="場次管理">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">場次不存在</div>
          </div>
        </MobileLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth={true} requireAdmin={true}>
      <MobileLayout title={session.name} showBackButton={true} onBack={() => router.push("/admin")}>
        <Tabs
          tabs={[
            {
              id: "settings",
              label: "設定",
              content: (
                <SessionSettingsTab
                  session={session}
                  onUpdate={handleUpdateSession}
                  onReload={loadSession}
                />
              ),
            },
            {
              id: "questions",
              label: "題目設定",
              content: <SessionQuestionsTab sessionId={sessionId} />,
            },
            {
              id: "assignments",
              label: "分配與進度",
              content: <SessionAssignmentsTab sessionId={sessionId} />,
            },
            {
              id: "results",
              label: "統計與結果",
              content: (
                <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                  <p className="text-gray-500">統計與結果功能開發中</p>
                </div>
              ),
            },
          ]}
          defaultTab="settings"
        />
      </MobileLayout>
    </AuthGuard>
  );
}

