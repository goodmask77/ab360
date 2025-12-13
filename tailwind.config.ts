import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // 黑金科技風格設計系統
        dark: {
          base: "#0B0F14",        // 最深背景
          surface: "#111827",     // 次深背景
          card: "#1F2937",        // 卡片背景
          border: "#374151",      // 邊框
          hover: "#2D3748",       // hover 狀態
        },
        gold: {
          light: "#D4AF37",       // 亮金色
          DEFAULT: "#C9A24D",     // 標準金色
          dark: "#B8941F",        // 深金色
          muted: "#8B7355",       // 低飽和金色
        },
        action: {
          DEFAULT: "#3B82F6",     // 冷藍色（主要按鈕）
          hover: "#2563EB",        // hover 狀態
          light: "#60A5FA",        // 淺藍色
        },
        text: {
          primary: "#F3F4F6",     // 主要文字
          secondary: "#9CA3AF",   // 次要文字
          muted: "#6B7280",       // 輔助文字
        },
      },
      borderRadius: {
        DEFAULT: "12px",          // 統一圓角
        sm: "8px",
        lg: "16px",
      },
      spacing: {
        // 統一间距系統
        xs: "8px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      boxShadow: {
        // 統一陰影系統
        card: "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
        cardHover: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [],
};
export default config;

