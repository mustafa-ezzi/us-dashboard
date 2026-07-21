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
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.85" },
        },
        "splash-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "splash-out": {
          "0%": { opacity: "1", transform: "scale(1)" },
          "100%": { opacity: "0", transform: "scale(1.02)" },
        },
        "birthday-rise": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "confetti-fall": {
          "0%": { transform: "translateY(-10vh) rotate(0deg)", opacity: "1" },
          "100%": {
            transform: "translateY(110vh) rotate(720deg)",
            opacity: "0.6",
          },
        },
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "splash-shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 240ms ease-out both",
        "pop-in": "pop-in 200ms ease-out both",
        "slide-up": "slide-up 400ms ease-out both",
        float: "float 3s ease-in-out infinite",
        "pulse-soft": "pulse-soft 2.5s ease-in-out infinite",
        "splash-in": "splash-in 500ms ease-out both",
        "splash-out": "splash-out 480ms ease-in forwards",
        "birthday-rise": "birthday-rise 600ms ease-out both",
        "confetti-fall": "confetti-fall linear infinite",
        shimmer: "shimmer 3s linear infinite",
        "splash-shimmer": "splash-shimmer 1.5s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
