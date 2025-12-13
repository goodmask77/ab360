"use client";

import { ReactNode } from "react";
import Link from "next/link";

interface MobileLayoutProps {
  children: ReactNode;
  title?: string;
  showBackButton?: boolean;
  onBack?: () => void;
  showHomeButton?: boolean;
}

/**
 * MobileLayout 元件
 * 手機優先的共用 Layout，置中顯示，最大寬度 430px
 */
export default function MobileLayout({
  children,
  title,
  showBackButton = false,
  onBack,
  showHomeButton = false,
}: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 標題列 */}
      {(title || showBackButton || showHomeButton) && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-[430px] w-full mx-auto px-4 py-3 flex items-center">
            {showBackButton && (
              <button
                onClick={onBack}
                className="mr-3 text-gray-600 hover:text-gray-900"
                aria-label="返回"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            {showHomeButton && !showBackButton && (
              <Link
                href="/home"
                className="mr-3 text-gray-600 hover:text-gray-900"
                aria-label="回到首頁"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </Link>
            )}
            {title && (
              <h1 className="text-lg font-semibold text-gray-900 flex-1">{title}</h1>
            )}
          </div>
        </div>
      )}

      {/* 內容區 */}
      <div className="max-w-[430px] w-full mx-auto px-4 py-6">{children}</div>
    </div>
  );
}

