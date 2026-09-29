import componentPlugins from "./tailwind/index.js";

const config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./lib/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {},
  },
  plugins: [...componentPlugins],
};

export default config;
