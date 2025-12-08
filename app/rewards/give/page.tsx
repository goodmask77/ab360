"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/hooks/useSession";
import {
  getRewardCategories,
  getEmployeesForVoting,
  getUserRemainingQuota,
  giveRewardPoints,
  type RewardCategory,
} from "@/lib/api/rewards";
import { getAllSessions } from "@/lib/api/sessions";
import MobileLayout from "@/components/MobileLayout";
import { AuthGuard } from "@/lib/auth-guard";
import Badge from "@/components/Badge";

type Step = "select-receiver" | "select-category" | "select-points" | "confirm" | "success";

export default function GiveRewardsPage() {
  const { employee, loading } = useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [categories, setCategories] = useState<RewardCategory[]>([]);
  const [employees, setEmployees] = useState<Array<{ id: string; name: string; department: string }>>([]);
  const [remainingQuota, setRemainingQuota] = useState<number>(0);
  const [step, setStep] = useState<Step>("select-receiver");
  const [selectedReceiver, setSelectedReceiver] = useState<{ id: string; name: string; department: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory | null>(null);
  const [selectedPoints, setSelectedPoints] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && employee) {
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employee, loading]);

  useEffect(() => {
    if (selectedSessionId && employee) {
      loadSessionData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSessionId, employee]);

  const loadInitialData = async () => {
    try {
      const [allSessions, allCategories] = await Promise.all([
        getAllSessions(),
        getRewardCategories(),
      ]);

      const openSessions = allSessions.filter((s) => s.status === "open");
      setSessions(openSessions);
      setCategories(allCategories);

      if (openSessions.length > 0 && !selectedSessionId) {
        setSelectedSessionId(openSessions[0].id);
      }
    } catch (error) {
      console.error("[API ERROR] load initial data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadSessionData = async () => {
    if (!employee || !selectedSessionId) return;

    try {
      const [quota, employeeList] = await Promise.all([
        getUserRemainingQuota(selectedSessionId, employee.id),
        getEmployeesForVoting(selectedSessionId, employee.id),
      ]);

      setRemainingQuota(quota);
      setEmployees(employeeList);
    } catch (error) {
      console.error("[API ERROR] load session data:", error);
    }
  };

  const handleNext = () => {
    if (step === "select-receiver" && selectedReceiver) {
      setStep("select-category");
    } else if (step === "select-category" && selectedCategory) {
      setStep("select-points");
    } else if (step === "select-points") {
      setStep("confirm");
    }
  };

  const handlePrevious = () => {
    if (step === "select-category") {
      setStep("select-receiver");
    } else if (step === "select-points") {
      setStep("select-category");
    } else if (step === "confirm") {
      setStep("select-points");
    }
  };

  const handleSubmit = async () => {
    if (!employee || !selectedSessionId || !selectedReceiver || !selectedCategory) return;

    if (selectedPoints > remainingQuota) {
      alert(`剩餘點數不足，目前剩餘 ${remainingQuota} 點`);
      return;
    }

    setSubmitting(true);
    try {
      await giveRewardPoints({
        sessionId: selectedSessionId,
        giverId: employee.id,
        receiverId: selectedReceiver.id,
        categoryKey: selectedCategory.key,
        points: selectedPoints,
      });

      setStep("success");
      await loadSessionData(); // 更新剩餘點數
    } catch (error: any) {
      alert("送出失敗: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadingData) {
    return (
      <MobileLayout title="送出積分">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-gray-500">載入中...</div>
        </div>
      </MobileLayout>
    );
  }

  if (sessions.length === 0) {
    return (
      <MobileLayout title="送出積分">
        <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
          <p className="text-gray-500">目前沒有進行中的積分活動</p>
        </div>
      </MobileLayout>
    );
  }

  // 成功頁面
  if (step === "success") {
    return (
      <MobileLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
          <div className="text-6xl animate-bounce">🎉</div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              積分已送出！
            </h2>
            <p className="text-gray-600">
              你剛剛送出 {selectedPoints} 點給 {selectedReceiver?.name}
            </p>
            <p className="text-gray-600 mt-1">
              （{selectedCategory?.name}）
            </p>
          </div>
          <div className="space-y-3 w-full">
            <button
              onClick={() => {
                setStep("select-receiver");
                setSelectedReceiver(null);
                setSelectedCategory(null);
                setSelectedPoints(10);
              }}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all"
            >
              再送一次
            </button>
            <button
              onClick={() => router.push("/rewards")}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-all"
            >
              返回積分首頁
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  // 確認頁面
  if (step === "confirm") {
    return (
      <MobileLayout
        title="確認送出"
        showBackButton={true}
        onBack={handlePrevious}
      >
        <div className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800 font-medium">
              ⚠️ 提醒：送出後無法修改
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">送給</div>
              <div className="text-lg font-semibold text-gray-900">
                {selectedReceiver?.name}
              </div>
              <Badge
                variant="info"
                size="sm"
                className="mt-1"
              >
                {selectedReceiver?.department === "front" ? "外場" : selectedReceiver?.department === "back" ? "內場" : selectedReceiver?.department}
              </Badge>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">類別</div>
              <div className="text-lg font-semibold text-gray-900">
                {selectedCategory?.name}
              </div>
              <div className="text-sm text-gray-600 mt-1">
                {selectedCategory?.description}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-500 mb-1">點數</div>
              <div className="text-3xl font-bold text-emerald-600">
                {selectedPoints} 點
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "送出中..." : "確認送出"}
            </button>
            <button
              onClick={handlePrevious}
              className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-300 transition-all"
            >
              返回修改
            </button>
          </div>
        </div>
      </MobileLayout>
    );
  }

  return (
    <AuthGuard requireAuth={true}>
      <MobileLayout
        title="送出積分"
        showBackButton={true}
        onBack={() => router.push("/rewards")}
      >
        <div className="space-y-6">
          {/* 剩餘點數顯示 */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200 text-center">
            <div className="text-sm text-gray-600 mb-1">剩餘可分配點數</div>
            <div className="text-3xl font-bold text-emerald-600">
              {remainingQuota} 點
            </div>
          </div>

          {/* 步驟 1：選擇同事 */}
          {step === "select-receiver" && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">選擇要送分的同事</h2>
              {employees.length === 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                  <p className="text-gray-500">目前沒有可選擇的同事</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {employees.map((emp) => (
                    <button
                      key={emp.id}
                      onClick={() => {
                        setSelectedReceiver(emp);
                        handleNext();
                      }}
                      className="w-full bg-white rounded-xl p-4 border-2 border-gray-200 hover:border-emerald-400 hover:shadow-lg transition-all text-left active:scale-[0.98]"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900 text-lg">
                            {emp.name}
                          </div>
                          <Badge
                            variant={emp.department === "front" ? "info" : "primary"}
                            size="sm"
                            className="mt-1"
                          >
                            {emp.department === "front" ? "外場" : emp.department === "back" ? "內場" : emp.department}
                          </Badge>
                        </div>
                        <span className="text-2xl">→</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 步驟 2：選擇類別 */}
          {step === "select-category" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">選擇類別</h2>
                <button
                  onClick={handlePrevious}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  返回
                </button>
              </div>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category);
                      handleNext();
                    }}
                    className={`w-full rounded-xl p-4 border-2 text-left transition-all active:scale-[0.98] ${
                      selectedCategory?.id === category.id
                        ? "bg-emerald-50 border-emerald-400 shadow-lg"
                        : "bg-white border-gray-200 hover:border-emerald-300"
                    }`}
                  >
                    <div className="font-semibold text-gray-900 text-lg mb-1">
                      {category.name}
                    </div>
                    {category.description && (
                      <div className="text-sm text-gray-600">
                        {category.description}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 步驟 3：選擇點數 */}
          {step === "select-points" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">選擇點數</h2>
                <button
                  onClick={handlePrevious}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  返回
                </button>
              </div>

              <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
                <div className="text-sm text-gray-600 mb-2">送給：{selectedReceiver?.name}</div>
                <div className="text-sm text-gray-600">類別：{selectedCategory?.name}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[5, 10, 20, 30].map((points) => {
                  const canSelect = points <= remainingQuota;
                  return (
                    <button
                      key={points}
                      onClick={() => {
                        if (canSelect) {
                          setSelectedPoints(points);
                        }
                      }}
                      disabled={!canSelect}
                      className={`rounded-xl p-4 border-2 transition-all active:scale-[0.98] ${
                        selectedPoints === points
                          ? "bg-emerald-500 border-emerald-600 text-white shadow-lg"
                          : canSelect
                          ? "bg-white border-gray-200 hover:border-emerald-300 text-gray-900"
                          : "bg-gray-100 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed"
                      }`}
                    >
                      <div className="text-2xl font-bold">{points}</div>
                      <div className="text-xs mt-1">點</div>
                    </button>
                  );
                })}
              </div>

              {selectedPoints > remainingQuota && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                  點數超過剩餘額度（剩餘 {remainingQuota} 點）
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={selectedPoints > remainingQuota}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                下一步：確認送出
              </button>
            </div>
          )}
        </div>
      </MobileLayout>
    </AuthGuard>
  );
}


