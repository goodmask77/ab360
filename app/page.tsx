import { redirect } from "next/navigation";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">歡迎使用 360 評鑑系統</h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          登入
        </Link>
        <Link
          href="/dashboard"
          className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
        >
          員工儀表板
        </Link>
        <Link
          href="/admin/dashboard"
          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
        >
          管理後台
        </Link>
      </div>
    </div>
  );
}
