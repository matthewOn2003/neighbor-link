import componentPlugins from "./tailwind/index.js";

const withOpacity = (name) => ({ opacityValue }) =>
  opacityValue === undefined
    ? `var(--${name})`
    : `color-mix(in srgb, var(--${name}) calc(${opacityValue} * 100%), transparent)`;

const withVar = (name) => `var(--${name})`;

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
      spacing: {
        gutter: "var(--gutter)",
        "page-padding-block": "var(--page-padding-block)",
        "page-padding-inline": "var(--page-padding-inline)",
        "section-gap": "var(--section-gap)",
        "header-gap": "var(--header-gap)",
        "field-gap": "var(--field-gap)",
        "label-gap": "var(--label-gap)",
        "panel-padding": "var(--panel-padding)",
      },
    },
  },
  plugins: [...componentPlugins],
};

export default config;