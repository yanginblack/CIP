import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        'light-plum': '#9C27B0',
        'lighter-plum': '#BA68C8',
        'amber': '#FFB300',
        'navy-dark': '#1a1625',
        'purple-dark': '#2d1b3d',
      }
    },
  },
  plugins: [],
};
export default config;
