import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Tmavá, mírně teplá škála — laděná k Remexo.cz
        bg: "#0B0B0D",
        surface: "#141416",
        surface2: "#1C1C20",
        line: "rgba(255,255,255,0.10)",
        fg: "#FAFAF9",
        muted: "#A1A1A6",
        accent: {
          DEFAULT: "#F59E0B",
          hover: "#FBBF24",
          soft: "rgba(245,158,11,0.14)",
        },
        success: "#34D399",
        danger: "#F87171",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #F59E0B 0%, #F97316 100%)",
        "gradient-primary-soft":
          "linear-gradient(135deg, rgba(245,158,11,0.16) 0%, rgba(249,115,22,0.16) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(245,158,11,0.5)",
        "glow-sm": "0 6px 20px -8px rgba(245,158,11,0.55)",
        card: "0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "16px",
        tag: "999px",
      },
    },
  },
  plugins: [],
};

export default config;
