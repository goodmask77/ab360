import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  // 簡化 middleware：主要路由保護由頁面層級的 AuthGuard 處理
  // 這裡只處理基本的公開路由邏輯
  const { pathname } = req.nextUrl;

  // 公開路由
  const publicRoutes = ["/login", "/"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // 所有路由都允許通過，具體的權限檢查由頁面層級處理
  // 這樣可以避免 middleware 中的複雜 session 檢查
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

