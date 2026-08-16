import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0A0A10",
        surface: "#15151F",
        surface2: "#1D1D2A",
        line: "rgba(255,255,255,0.09)",
        fg: "#F5F4F2",
        muted: "#9A97AC",
        accent: {
          DEFAULT: "#FF4D6D",
          soft: "rgba(255,77,109,0.16)",
        },
        violet: {
          DEFAULT: "#8B5CF6",
          soft: "rgba(139,92,246,0.16)",
        },
        gold: "#FFC94A",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #FF4D6D 0%, #8B5CF6 100%)",
        "gradient-primary-soft": "linear-gradient(135deg, rgba(255,77,109,0.18) 0%, rgba(139,92,246,0.18) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(255,77,109,0.45), 0 0 80px -20px rgba(139,92,246,0.35)",
        "glow-sm": "0 0 20px -6px rgba(255,77,109,0.4)",
        "glow-violet": "0 0 30px -8px rgba(139,92,246,0.45)",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        card: "20px",
        tag: "999px",
      },
      keyframes: {
        "pop-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "pop-in": "pop-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
