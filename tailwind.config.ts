import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fantasy: {
          dark: "#0f1117",
          darker: "#0a0c10",
          card: "#161b26",
          border: "#232b3e",
          gold: "#d4af37",
          goldHover: "#e5c158",
          crimson: "#8b0000",
          crimsonBright: "#dc2626",
          parchment: "#f4ecd8",
          emerald: "#10b981",
        },
      },
    },
  },
  plugins: [],
};
export default config;
