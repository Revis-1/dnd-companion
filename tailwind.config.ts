import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        'glass-glow': '0 0 20px rgba(255, 255, 255, 0.07)',
        'glass-card': '0 10px 30px 0 rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        fantasy: ['Cinzel', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
