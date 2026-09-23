import type { Config } from "tailwindcss";
import componentPlugins from "./tailwind";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [...componentPlugins],
};

export default config;