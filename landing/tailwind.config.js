import componentPlugins from "./tailwind/index.js";

const withOpacity = (name) => ({ opacityValue }) =>
  opacityValue === undefined
    ? `var(--${name})`
    : `color-mix(in srgb, var(--${name}) calc(${opacityValue} * 100%), transparent)`;

const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: withOpacity("paper"),
        ink: withOpacity("ink"),
        muted: withOpacity("muted"),
        line: withOpacity("line"),
        night: withOpacity("night"),
        lavender: withOpacity("lavender"),
        plum: withOpacity("plum"),
        lilac: withOpacity("lilac"),
        sage: withOpacity("sage"),
        mist: withOpacity("mist"),
        gold: withOpacity("gold"),
        primary: withOpacity("primary"),
        "primary-content": withOpacity("primary-content"),
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      maxWidth: {
        site: "80rem",
      },
    },
  },
  plugins: [...componentPlugins],
};

export default config;
