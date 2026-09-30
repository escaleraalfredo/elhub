import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Theme-aware colors (values in app/globals.css)
        ink: "var(--ink)",
        brand: "var(--brand)",
        coral: "var(--coral)",
        palm: "var(--palm)",
        flag: { red: "var(--flag-red)", blue: "var(--flag-blue)" },
      },
    },
  },
  plugins: [],
};

export default config;
