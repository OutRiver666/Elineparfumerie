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
          bg: "#FFFFFF",
          secondary: "#F8F7F4",
          surface: "#F2F0EC",
          text: "#171717",
          "text-secondary": "#737373",
          "text-muted": "#A3A3A3",
          accent: "#9A7655",
          "accent-hover": "#836446",
          "accent-light": "#F7F3EE",
          border: "#EBE8E1",
          gold: "#C5A880",
        },
        background: "#FFFFFF",
        foreground: "#171717",
        muted: {
          DEFAULT: "#F8F7F4",
          foreground: "#737373",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#171717",
        },
        popover: {
          DEFAULT: "#FFFFFF",
          foreground: "#171717",
        },
        primary: {
          DEFAULT: "#171717",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F2F0EC",
          foreground: "#171717",
        },
        accent: {
          DEFAULT: "#9A7655",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#DC2626",
          foreground: "#FFFFFF",
        },
        border: "#EBE8E1",
        input: "#EBE8E1",
        ring: "#9A7655",
      },
      borderRadius: {
        DEFAULT: "6px",
        sm: "4px",
        md: "6px",
        lg: "8px",
        xl: "10px",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Playfair Display", "Cormorant Garamond", "Georgia", "serif"],
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        outfit: ["var(--font-outfit)", "Outfit", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        arabic: ["var(--font-arabic)", "Amiri", "IBM Plex Sans Arabic", "Noto Naskh Arabic", "serif"],
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
