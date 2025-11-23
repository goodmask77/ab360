import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AB360 評鑑平台",
  description: "餐飲夥伴自評互評與積分管理",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <body
        className={cn(
          "min-h-svh bg-white text-slate-900 antialiased",
          "dark:bg-zinc-950 dark:text-zinc-100",
          geistSans.variable,
          geistMono.variable,
        )}
      >
        {children}
      </body>
    </html>
  );
}
