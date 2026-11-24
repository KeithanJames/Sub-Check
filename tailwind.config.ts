import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#08090C",
          subtle: "#0D111A",
          card: "#111622",
          tile: "#0E131E",
          hover: "#161D2B",
        },
        border: {
          DEFAULT: "#1B2232",
          subtle: "#151B27",
          focus: "#D4F940",
        },
        accent: {
          lime: "#D4F940",
          limeHover: "#C4EB2E",
          limeMuted: "rgba(212, 249, 64, 0.12)",
          limeBorder: "rgba(212, 249, 64, 0.35)",
          lavender: "#C4B5FD",
          lavenderMuted: "rgba(196, 181, 253, 0.12)",
          lavenderBorder: "rgba(196, 181, 253, 0.3)",
        },
        brand: {
          50: "#EEF2FF",
          100: "#E0E7FF",
          500: "#6366F1",
          600: "#4F46E5",
          700: "#4338CA",
          accent: "#D4F940", // Switch primary accent to vivid lime
          accentHover: "#C4EB2E",
        },
        status: {
          active: "#22C55E",
          trial: "#38BDF8",
          review: "#F59E0B",
          waste: "#EF4444",
          urgent: "#F43F5E",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(0, 0, 0, 0.5)",
        tile: "0 4px 20px -2px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(27, 34, 50, 0.8)",
        limeGlow: "0 0 25px -4px rgba(212, 249, 64, 0.25)",
        lavenderGlow: "0 0 25px -4px rgba(196, 181, 253, 0.2)",
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.25rem',
      },
    },
  },
  plugins: [],
};

export default config;
