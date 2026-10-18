import componentPlugins from "./tailwind/index.js";

const withOpacity = (name) => ({ opacityValue }) =>
  opacityValue === undefined
    ? `var(--${name})`
    : `color-mix(in srgb, var(--${name}) calc(${opacityValue} * 100%), transparent)`;

const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        scene: withOpacity("scene"),
        "scene-content": withOpacity("scene-content"),
        subtle: withOpacity("subtle"),
        primary: withOpacity("primary"),
        "primary-dark": withOpacity("primary-dark"),
        "primary-content": withOpacity("primary-content"),
        accent: withOpacity("accent"),
        "accent-content": withOpacity("accent-content"),
        highlight: withOpacity("highlight"),
        line: withOpacity("line"),
        success: withOpacity("success"),
        error: withOpacity("error"),
      },
    },
  },
  plugins: [...componentPlugins],
};

export default config;