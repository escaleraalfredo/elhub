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
        dark: {
          bg: "#0A0F1C",
          card: "#121826",
          border: "#1F2A44",
        },
      },
    },
  },
  plugins: [],
};

export default config;