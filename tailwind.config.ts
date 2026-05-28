import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50:  "#f0f5f1",
          100: "#dceade",
          200: "#b9d4bc",
          300: "#8eb893",
          400: "#5f9767",
          500: "#3d7a47",
          600: "#2d6236",
          700: "#264f2d",
          800: "#1e3f24",
          900: "#1a3a2a",
          950: "#0d1f15",
        },
        cream: {
          50:  "#fdfaf4",
          100: "#f9f3e6",
          200: "#f2e8d0",
          300: "#e8d9b5",
          400: "#dcc795",
          500: "#ceb474",
          DEFAULT: "#f5f0e8",
        },
        terra: {
          100: "#f5e6d8",
          200: "#e8c9a8",
          300: "#d4a878",
          400: "#c17f4e",
          500: "#a86435",
          600: "#8a4e25",
          700: "#6b3c1c",
        },
        royal: {
          700: "#1e3a8a",
          800: "#1d4ed8",
        },
        stone: {
          50:  "#fafafa",
          100: "#f4f4f4",
          200: "#e8e8e8",
          300: "#d4d4d4",
          400: "#a8a8a8",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#2a2a2a",
          900: "#1a1a1a",
        },
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans:  ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-2xl": ["clamp(3rem, 8vw, 7rem)",      { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "display-xl":  ["clamp(2.5rem, 6vw, 5rem)",    { lineHeight: "1.1",  letterSpacing: "-0.02em" }],
        "display-lg":  ["clamp(2rem, 4vw, 3.5rem)",    { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "display-md":  ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.2",  letterSpacing: "-0.01em" }],
      },
      boxShadow: {
        "luxury":     "0 25px 50px -12px rgba(26, 58, 42, 0.18)",
        "card":       "0 4px 24px rgba(26, 58, 42, 0.08)",
        "card-hover": "0 12px 40px rgba(26, 58, 42, 0.16)",
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;