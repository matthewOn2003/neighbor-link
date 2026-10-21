import plugin from "tailwindcss/plugin";

// Utilities for respecting device safe areas (notches, home indicators) on mobile viewports.
export default plugin(function ({ addUtilities }) {
  addUtilities({
    ".pt-safe": {
      paddingTop: "env(safe-area-inset-top, 0px)",
    },
    ".pb-safe": {
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    },
    ".pl-safe": {
      paddingLeft: "env(safe-area-inset-left, 0px)",
    },
    ".pr-safe": {
      paddingRight: "env(safe-area-inset-right, 0px)",
    },
    ".top-safe": {
      top: "env(safe-area-inset-top, 0px)",
    },
    ".bottom-safe": {
      bottom: "env(safe-area-inset-bottom, 0px)",
    },
    ".scroll-pt-safe": {
      scrollPaddingTop: "env(safe-area-inset-top, 0px)",
    },
  });
});
