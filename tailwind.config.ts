import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      keyframes: {
        pop: {
          "0%": { opacity: "0", transform: "scale(0.85) translateY(8px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        },
      },
      animation: {
        pop: "pop 0.4s ease-out both",
        wiggle: "wiggle 0.25s ease-in-out infinite",
      },
      colors: {
        brand: {
          50: "#fff5f2",
          100: "#ffe4dc",
          200: "#ffc9ba",
          400: "#fb7a5c",
          500: "#f4553a",
          600: "#e03a1e",
          700: "#b32a13",
        },
      },
    },
  },
  plugins: [],
};

export default config;
