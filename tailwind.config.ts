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
        // 黑金科技風格色彩
        dark: {
          base: "#0B0F14",
          surface: "#111827",
          card: "#1F2937",
          border: "#374151",
        },
        gold: {
          light: "#D4AF37",
          DEFAULT: "#C9A24D",
          dark: "#B8941F",
          muted: "#8B7355",
        },
      },
    },
  },
  plugins: [],
};
export default config;

