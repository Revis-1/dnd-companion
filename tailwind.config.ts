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
          // Dark oak wood & leather table
          table: "#120a05",
          tableDark: "#0a0502",
          wood: "#26160c",
          woodLight: "#3d2414",
          woodBorder: "#52331c",
          
          // Leather journal bindings
          leather: "#21140d",
          leatherBorder: "#452917",
          leatherLight: "#331f13",

          // Aged parchment
          parchment: "#f7edd4",
          parchmentDark: "#d6c39e",
          parchmentMuted: "#a89474",
          scrollBg: "#1f1811",
          scrollBorder: "#3f2e1e",

          // Gilded gold & brass
          gold: "#d4af37",
          goldBright: "#f3d068",
          goldMuted: "#967824",
          brass: "#c59b27",

          // Wax seal & crimson
          crimson: "#801818",
          crimsonBright: "#b91c1c",
          sealRed: "#941b0c",
          emerald: "#15803d",
        },
      },
      boxShadow: {
        'tome': '0 15px 35px -5px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 215, 0, 0.15)',
        'paper': '0 4px 15px rgba(0, 0, 0, 0.5), inset 0 0 10px rgba(0, 0, 0, 0.4)',
        'goldGlow': '0 0 15px rgba(212, 175, 55, 0.3)',
      },
      fontFamily: {
        tome: ['Cinzel', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
