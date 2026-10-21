import componentPlugins from "./tailwind/index.js";

const withOpacity = (name) => ({ opacityValue }) =>
  opacityValue === undefined
    ? `var(--${name})`
    : `color-mix(in srgb, var(--${name}) calc(${opacityValue} * 100%), transparent)`;

// Stitch design tokens (tenant-design/*.html). Dark surfaces, violet primary, gold secondary.
const designColors = {
  "surface-container-low": "#161722",
  "surface-bright": "#383843",
  "surface-container-high": "#232431",
  "surface-dim": "#0e0f17",
  "tertiary": "#c0c1ff",
  "tertiary-fixed-dim": "#c0c1ff",
  "outline": "#958ea0",
  "on-secondary-container": "#342800",
  "secondary-container": "#af8d11",
  "on-tertiary-fixed": "#07006c",
  "on-surface-variant": "#a7a0b5",
  "surface-tint": "#d0bcff",
  "surface": "#0d0e17",
  "secondary-fixed-dim": "#e9c349",
  "on-secondary-fixed-variant": "#574500",
  "primary-fixed-dim": "#d0bcff",
  "on-tertiary": "#1000a9",
  "primary": "#d0bcff",
  "on-primary-fixed-variant": "#5516be",
  "background": "#0d0e17",
  "on-surface": "#f3f2fa",
  "secondary-fixed": "#ffe088",
  "inverse-primary": "#6d3bd7",
  "on-tertiary-fixed-variant": "#2f2ebe",
  "error": "#ffb4ab",
  "error-container": "#93000a",
  "surface-container": "#1c1d29",
  "on-primary-container": "#340080",
  "on-secondary-fixed": "#241a00",
  "on-primary": "#3c0091",
  "tertiary-fixed": "#e1e0ff",
  "secondary": "#f4cb48",
  "primary-fixed": "#e9ddff",
  "surface-container-lowest": "#08090f",
  "outline-variant": "#494454",
  "surface-variant": "#2a2b37",
  "surface-container-highest": "#2f303e",
  "inverse-surface": "#e3e1ef",
  "on-background": "#f3f2fa",
  "on-tertiary-container": "#0d0096",
  "on-error-container": "#ffdad6",
  "on-primary-fixed": "#23005c",
  "tertiary-container": "#8083ff",
  "primary-container": "#7c3aed",
  "inverse-on-surface": "#2f303a",
  "on-secondary": "#3c2f00",
  "on-error": "#690005"
};

const designRadius = {
  "DEFAULT": "0.25rem",
  "lg": "0.625rem",
  "xl": "1rem",
  "2xl": "1.25rem",
  "3xl": "1.75rem",
  "full": "9999px"
};

const designSpacing = {
  "space-xs": "0.25rem",
  "space-sm": "0.5rem",
  "space-md": "1rem",
  "space-lg": "1.5rem",
  "space-xl": "2.25rem",
  "margin": "1.125rem",
  "gutter": "1rem"
};

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
        ...designColors,
      },
      borderRadius: designRadius,
      spacing: {
        "page-padding-block": "var(--page-padding-block)",
        "page-padding-inline": "var(--page-padding-inline)",
        "section-gap": "var(--section-gap)",
        "header-gap": "var(--header-gap)",
        "field-gap": "var(--field-gap)",
        "label-gap": "var(--label-gap)",
        "panel-padding": "var(--panel-padding)",
        ...designSpacing,
        gutter: "var(--gutter)",
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "sans-serif"],
      },
    },
  },
  plugins: [...componentPlugins],
};

export default config;
