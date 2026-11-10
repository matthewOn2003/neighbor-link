import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".btn": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      height: "3rem",
      padding: "0 1.25rem",
      borderRadius: "var(--button-radius)",
      fontWeight: "600",
      fontSize: "0.9375rem",
      border: "var(--border-width) solid transparent",
      transitionProperty: "background-color, border-color, color, transform",
      transitionDuration: "var(--transition-duration)",
      cursor: "pointer",
      whiteSpace: "nowrap",

      "&:active": {
        transform: "scale(0.98)",
      },

      "&:focus-visible": {
        outline: "var(--focus-ring-width) solid var(--primary)",
        outlineOffset: "2px",
      },
    },

    ".btn-primary": {
      backgroundColor: "var(--night)",
      color: "var(--primary-content)",
      "&:hover": {
        backgroundColor: "color-mix(in srgb, var(--night) 85%, white)",
      },
    },

    ".btn-outline": {
      backgroundColor: "var(--paper)",
      color: "var(--ink)",
      borderColor: "var(--line)",
      "&:hover": {
        borderColor: "var(--ink)",
      },
    },

    ".btn-light": {
      backgroundColor: "var(--primary-content)",
      color: "var(--night)",
      "&:hover": {
        backgroundColor: "color-mix(in srgb, var(--primary-content) 88%, var(--night))",
      },
    },
  });
});
