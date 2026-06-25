import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: "#0F172A",
        accent: "#6366F1",
      },
    },
  },
  plugins: [],
} satisfies Config;
