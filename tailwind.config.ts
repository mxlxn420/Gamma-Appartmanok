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
          50:  "#f5ece4",
          100: "#e8d0bc",
          200: "#d6b89c",
          300: "#c0a080",
          400: "#ac8868",
          500: "#987458",
          600: "#886248",
          700: "#765238",
          800: "#664228",
          900: "#543018",
          950: "#381e0a",
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
          100: "#fef3dc",
          200: "#fce3a8",
          300: "#f8cc6a",
          400: "#e8a832",
          500: "#c88a1a",
          600: "#a86e0c",
          700: "#7a5008",
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
        "luxury":     "0 25px 50px -12px rgba(84, 48, 24, 0.18)",
        "card":       "0 4px 24px rgba(84, 48, 24, 0.08)",
        "card-hover": "0 12px 40px rgba(84, 48, 24, 0.16)",
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
