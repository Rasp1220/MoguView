import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
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
