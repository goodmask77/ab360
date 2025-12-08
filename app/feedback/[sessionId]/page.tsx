"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import { getSessionById, type EvaluationSession } from "@/lib/api/sessions";
import { createBrowserSupabaseClient } from "@/lib/supabaseClient";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { employee, loading } = useSession();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<EvaluationSession | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && employee) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, employee, loading]);

  const loadData = async () => {
    try {
      const sessionData = await getSessionById(sessionId);
      setSession(sessionData);
    } catch (error) {
      console.error("載入資料失敗:", error);
    } finally {
      setLoadingData(false);
    }
  };

  return (
    <AuthGuard requireAuth={true}>
      {loading || loadingData ? (
        <MobileLayout title="回饋詳情">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">載入中...</div>
          </div>
        </MobileLayout>
      ) : !session ? (
        <MobileLayout title="回饋詳情">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-gray-500">場次不存在</div>
          </div>
        </MobileLayout>
      ) : (
        <MobileLayout title={session.name} showBackButton={true} onBack={() => router.push("/feedback")}>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-500">回饋詳情功能開發中</p>
            <p className="text-sm text-gray-400 mt-2">將在階段(6)完整實作</p>
          </div>
        </MobileLayout>
      )}
    </AuthGuard>
  );
}

