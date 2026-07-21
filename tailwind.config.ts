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
        // Brand palette — CSS vars so engagement day can retheme the app
        rose: {
          DEFAULT: "rgb(var(--rose-rgb) / <alpha-value>)",
          50: "rgb(var(--rose-50-rgb) / <alpha-value>)",
          100: "rgb(var(--rose-100-rgb) / <alpha-value>)",
          200: "rgb(var(--rose-200-rgb) / <alpha-value>)",
          300: "rgb(var(--rose-300-rgb) / <alpha-value>)",
          400: "rgb(var(--rose-400-rgb) / <alpha-value>)",
          500: "rgb(var(--rose-rgb) / <alpha-value>)",
          600: "rgb(var(--rose-600-rgb) / <alpha-value>)",
          700: "rgb(var(--rose-700-rgb) / <alpha-value>)",
          800: "rgb(var(--rose-800-rgb) / <alpha-value>)",
          900: "rgb(var(--rose-900-rgb) / <alpha-value>)",
        },
        ink: {
          DEFAULT: "#2D2D2D",
          soft: "#4B4B4B",
          muted: "#6B6B6B",
          subtle: "#9A9A9A",
        },
        cream: "rgb(var(--cream-rgb) / <alpha-value>)",
        line: "rgb(var(--line-rgb) / <alpha-value>)",
        secondary: {
          DEFAULT: "rgb(var(--secondary-rgb) / <alpha-value>)",
          50: "rgb(var(--secondary-50-rgb) / <alpha-value>)",
          100: "rgb(var(--secondary-100-rgb) / <alpha-value>)",
        },
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
        card: "0 1px 2px rgba(45,45,45,0.04), 0 4px 16px rgb(var(--rose-rgb) / 0.06)",
        cardHover:
          "0 2px 4px rgba(45,45,45,0.06), 0 8px 24px rgb(var(--rose-rgb) / 0.10)",
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
