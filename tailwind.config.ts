import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Puerto Rican Flag Colors
        pr: {
          red: "#E92228",
          blue: "#003087",
          white: "#FFFFFF",
        },
        // Single app-wide surface palette (matches zinc-950/900/800)
        dark: {
          bg: "#09090b",
          card: "#18181b",
          border: "#27272a",
        },
      },
    },
  },
  plugins: [],
};

export default config;