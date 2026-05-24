import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette from PRD §4.2
        rose: {
          DEFAULT: "#E91E8C", // primary
          50: "#FDF2F8",
          100: "#FCE4EC",
          200: "#FBCFE0",
          300: "#F9A8C8",
          400: "#F472A8",
          500: "#E91E8C",
          600: "#C8167A",
          700: "#A11260",
          800: "#7A0E48",
          900: "#530931",
        },
        ink: {
          DEFAULT: "#2D2D2D",
          soft: "#4B4B4B",
          muted: "#6B6B6B",
          subtle: "#9A9A9A",
        },
        cream: "#FFF9FB",
        line: "#F1E3EA",
      },
      fontFamily: {
        sans: [
          "Inter",
          "DM Sans",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(45,45,45,0.04), 0 4px 16px rgba(233,30,140,0.06)",
        cardHover:
          "0 2px 4px rgba(45,45,45,0.06), 0 8px 24px rgba(233,30,140,0.10)",
      },
      borderRadius: {
        xl: "14px",
        "2xl": "18px",
        "3xl": "22px",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pop-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out both",
        "pop-in": "pop-in 200ms ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
