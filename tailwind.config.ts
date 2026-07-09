import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        cream: "#fff7ed",
        ink: "#243035",
        mia: "#f97316",
        mint: "#2dd4bf"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(36, 48, 53, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
