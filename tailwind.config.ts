import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "sans-serif",
        ],
        display: ["var(--font-display)", "Georgia", "Cambria", "serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#123C3A",
          50: "#EAF4F1",
          100: "#D6E9E4",
          200: "#C2DED8",
          300: "#95C2BA",
          400: "#5C9690",
          500: "#2B6F6A",
          600: "#205C58",
          700: "#174844",
          800: "#123C3A",
          900: "#0E2423",
        },
        accent: "#B88A44",
        // semantic tokens — components use these instead of raw palette colors
        success: "#205C58",
        warn: "#B88A44",
        danger: "#B4452E",
        info: "#5B7089",
        canvas: "rgb(var(--canvas) / <alpha-value>)",
        panel: "rgb(var(--panel) / <alpha-value>)",
        ink: "rgb(var(--ink) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        sidebar: "#111413",
        "sidebar-line": "#252B29",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #123C3A 0%, #205C58 100%)",
        "page-wash":
          "radial-gradient(circle at 18% -4%, rgba(184,138,68,0.06), transparent 30%), linear-gradient(180deg, #F7F5EF 0%, #F3F0E8 100%)",
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "0.875rem",
        "3xl": "1rem",
      },
      boxShadow: {
        soft: "0 1px 2px rgba(17,20,19,0.04), 0 10px 28px -22px rgba(17,20,19,0.34)",
        lift: "0 1px 2px rgba(17,20,19,0.05), 0 22px 46px -30px rgba(17,20,19,0.44)",
        glow: "0 0 0 1px rgba(184,138,68,0.18), 0 18px 42px -28px rgba(184,138,68,0.55)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s cubic-bezier(0.2,0.8,0.2,1) both",
      },
    },
  },
  plugins: [],
} satisfies Config;
