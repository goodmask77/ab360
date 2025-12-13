"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MobileLayout from "@/components/MobileLayout";

export default function SetupAccountsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSetup = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/auth/setup-accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "設定失敗");
      }

      setResult(data);
    } catch (err: any) {
      console.error("設定帳號錯誤:", err);
      setError(err.message || "設定失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <MobileLayout title="設定帳號權限" showHomeButton={true}>
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">帳號權限設定</h2>
          
          <div className="space-y-4 mb-6">
            <div className="border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold text-gray-900">goodmask77@gmail.com</h3>
              <p className="text-sm text-gray-600">角色：測試員工 (staff)</p>
              <p className="text-xs text-gray-500">部門：外場</p>
            </div>

            <div className="border-l-4 border-orange-500 pl-4">
              <h3 className="font-semibold text-gray-900">gooodmask77@gmail.com</h3>
              <p className="text-sm text-gray-600">角色：系統管理員 (owner)</p>
              <p className="text-xs text-gray-500">部門：管理層</p>
              <p className="text-xs text-orange-600 mt-1">
                ✓ 可編輯、新增、刪減所有資料<br />
                ✓ 可查看所有資料<br />
                ✓ 可建立及發佈 ab360 評鑑
              </p>
            </div>
          </div>

          <button
            onClick={handleSetup}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "設定中..." : "開始設定帳號權限"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
            <p className="font-semibold">錯誤</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {result && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
            <p className="font-semibold">設定成功！</p>
            <div className="mt-3 space-y-2">
              {result.results?.map((r: any, index: number) => (
                <div key={index} className="text-sm">
                  <p>
                    <strong>{r.email}</strong> - {r.action === "created" ? "已建立" : "已更新"} →{" "}
                    <span className="font-semibold">
                      {r.role === "owner" ? "系統管理員" : r.role === "staff" ? "測試員工" : r.role}
                    </span>
                  </p>
                </div>
              ))}
            </div>
            <p className="text-sm mt-3 text-gray-600">
              現在可以使用這兩個帳號登入系統了。
            </p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-semibold mb-2">說明：</p>
          <ul className="list-disc list-inside space-y-1">
            <li>此功能會自動建立或更新兩個帳號的權限設定</li>
            <li>如果帳號不存在，會自動建立</li>
            <li>如果帳號已存在，會更新其角色和資料</li>
            <li>設定完成後，請重新登入以套用新的權限</li>
          </ul>
        </div>
      </div>
    </MobileLayout>
  );
}

