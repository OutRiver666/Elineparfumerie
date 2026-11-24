import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: {
        "2xl": "1280px",
      },
    },
    extend: {
      colors: {
        luxury: {
          bg: "rgb(var(--lux-bg) / <alpha-value>)",
          secondary: "rgb(var(--lux-secondary) / <alpha-value>)",
          surface: "rgb(var(--lux-surface) / <alpha-value>)",
          text: "rgb(var(--lux-text) / <alpha-value>)",
          "text-secondary": "rgb(var(--lux-text-secondary) / <alpha-value>)",
          "text-muted": "rgb(var(--lux-text-muted) / <alpha-value>)",
          accent: "rgb(var(--lux-accent) / <alpha-value>)",
          "accent-hover": "rgb(var(--lux-accent-hover) / <alpha-value>)",
          "accent-light": "rgb(var(--lux-accent-light) / <alpha-value>)",
          border: "rgb(var(--lux-border) / <alpha-value>)",
          gold: "rgb(var(--lux-gold) / <alpha-value>)",
        },
        background: "rgb(var(--lux-bg) / <alpha-value>)",
        foreground: "rgb(var(--lux-text) / <alpha-value>)",
        muted: {
          DEFAULT: "rgb(var(--lux-secondary) / <alpha-value>)",
          foreground: "rgb(var(--lux-text-secondary) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--lux-bg) / <alpha-value>)",
          foreground: "rgb(var(--lux-text) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--lux-bg) / <alpha-value>)",
          foreground: "rgb(var(--lux-text) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "rgb(var(--lux-text) / <alpha-value>)",
          foreground: "rgb(var(--lux-bg) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--lux-surface) / <alpha-value>)",
          foreground: "rgb(var(--lux-text) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--lux-accent) / <alpha-value>)",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        border: "rgb(var(--lux-border) / <alpha-value>)",
        input: "rgb(var(--lux-border) / <alpha-value>)",
        ring: "rgb(var(--lux-accent) / <alpha-value>)",
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
      },
      fontFamily: {
        serif: [
          "var(--font-theme-display)",
          "var(--font-serif)",
          "Playfair Display",
          "Cormorant Garamond",
          "Georgia",
          "serif",
        ],
        sans: [
          "var(--font-theme-body)",
          "var(--font-sans)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        outfit: ["var(--font-outfit)", "Outfit", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        arabic: [
          "var(--font-theme-arabic)",
          "var(--font-arabic)",
          "Amiri",
          "IBM Plex Sans Arabic",
          "Noto Naskh Arabic",
          "serif",
        ],
      },
      boxShadow: {
        subtle: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
        luxury: "0 10px 30px -10px rgba(0, 0, 0, 0.05)",
        floating: "0 20px 40px -15px rgba(0, 0, 0, 0.08)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
