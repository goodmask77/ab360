import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ab360 評鑑系統",
  description: "餐飲業 360 度評鑑系統",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <body>
        <div className="min-h-screen bg-gray-50">
          {/* 上方導航欄 */}
          <nav className="bg-gray-900 text-white px-4 py-3">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-lg font-semibold">ab360 評鑑系統</h1>
            </div>
          </nav>

          {/* 主內容區 */}
          <main className="max-w-7xl mx-auto px-4 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

