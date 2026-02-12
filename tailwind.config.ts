import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0f0f1e",
        foreground: "#ffffff",
        primary: {
          DEFAULT: "#00ff88",
          foreground: "#0f0f1e",
        },
        secondary: {
          DEFAULT: "#00d9ff",
          foreground: "#0f0f1e",
        },
        accent: {
          DEFAULT: "#ff006e",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#333344",
          foreground: "#888899",
        },
        border: "#1a1a2e",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      backdropBlur: {
        xs: "2px",
      },
      boxShadow: {
        neon: "0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 217, 255, 0.2)",
        "neon-red": "0 0 20px rgba(255, 0, 110, 0.3), 0 0 40px rgba(255, 0, 110, 0.2)",
      },
      keyframes: {
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: ".8" },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 217, 255, 0.2)",
          },
          "50%": {
            boxShadow: "0 0 30px rgba(0, 255, 136, 0.5), 0 0 60px rgba(0, 217, 255, 0.4)",
          },
        },
      },
      animation: {
        glow: "glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
