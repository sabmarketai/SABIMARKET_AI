import type { Config } from "tailwindcss";

// Design tokens grounded in the visual world of a Nigerian open-air market:
// adire indigo dye, palm-oil gold, scotch-bonnet pepper red, cassava-leaf
// green, and terracotta clay pots. See README.md for the design rationale.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAF3E6", // rice-sack cream, base background
        indigo: {
          DEFAULT: "#1E3A5F", // adire dye indigo, primary dark surface/text
          soft: "#2E4F73",
        },
        gold: {
          DEFAULT: "#E0A526", // palm-oil / turmeric gold, primary accent + CTA
          light: "#F3C868",
          dark: "#B9840F",
        },
        pepper: "#C1443A", // scotch bonnet red, alerts / losses
        cassava: "#3F7A4E", // cassava-leaf green, profit / success
        clay: "#B5651D", // terracotta clay, secondary accent
        ink: "#221A12", // near-black warm ink for body text
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-manrope)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
      },
      borderRadius: {
        card: "1.25rem",
      },
      boxShadow: {
        stamp: "0 2px 0 0 rgba(34, 26, 18, 0.15)",
        card: "0 10px 30px -12px rgba(30, 58, 95, 0.25)",
      },
      keyframes: {
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.6" },
          "70%": { transform: "scale(1.8)", opacity: "0" },
          "100%": { transform: "scale(1.8)", opacity: "0" },
        },
        wave: {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
      },
      animation: {
        pulseRing: "pulseRing 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
        wave: "wave 0.9s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
