"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const { user, employee, loading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <nav className="bg-gray-900 text-white px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold hover:opacity-80">
          ab360 評鑑系統
        </Link>

        <div className="flex items-center gap-4">
          {loading ? (
            <span className="text-sm text-gray-400">載入中...</span>
          ) : user ? (
            <>
              <span className="text-sm text-gray-300">
                {employee?.name || user.email}
                {employee?.role && (
                  <span className="ml-2 text-xs bg-blue-600 px-2 py-1 rounded">
                    {employee.role === "owner"
                      ? "管理員"
                      : employee.role === "duty"
                      ? "Duty"
                      : "夥伴"}
                  </span>
                )}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-300 hover:text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors"
              >
                登出
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-gray-300 hover:text-white px-3 py-1 rounded hover:bg-gray-800 transition-colors"
            >
              登入
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

