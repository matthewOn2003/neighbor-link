import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".btn": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      height: "40px",
      padding: "0 12px",
      borderRadius: "var(--button-radius)",
      fontWeight: "600",
      fontSize: "14px",
      // lineHeight: "1",
      border: "var(--border-width) solid transparent",
      boxShadow: "var(--shadow-sm, 0 1px 2px 0 rgb(0 0 0 / 0.05))",
      transitionProperty:
        "background-color, border-color, color, opacity, box-shadow, transform",
      transitionDuration: "var(--transition-duration)",
      cursor: "pointer",

      "&:disabled, &[aria-disabled='true']": {
        cursor: "not-allowed",
        opacity: "0.45",
        pointerEvents: "none",
        boxShadow: "none",
      },

      "&:active:not(:disabled):not([aria-disabled='true'])": {
        transform: "scale(0.98)",
      },

      "&:focus-visible": {
        outline: "var(--focus-ring-width) solid var(--primary)",
        outlineOffset: "2px",
      },

      "@media (min-width: 640px)": {
        height: "3rem",
        padding: "0 1rem",
      },
    },

    ".btn-primary": {
      backgroundColor: "var(--primary)",
      color: "var(--primary-content)",
      "&:hover:not(:disabled):not([aria-disabled='true'])": {
        backgroundColor: "var(--primary-dark)",
      },
      "&:active:not(:disabled):not([aria-disabled='true'])": {
        backgroundColor:
          "color-mix(in srgb, var(--primary-dark) 90%, black)",
      },
    },
    ".btn-outline": {
      backgroundColor: "var(--accent)",
      color: "var(--scene-content)",
      borderColor: "var(--subtle)",
      "&:hover:not(:disabled):not([aria-disabled='true'])": {
        backgroundColor: "color-mix(in srgb, var(--primary) 8%, var(--accent))",
        borderColor: "color-mix(in srgb, var(--primary) 50%, var(--line))",
        color: "var(--primary)",
      },
      "&:active:not(:disabled):not([aria-disabled='true'])": {
        backgroundColor: "color-mix(in srgb, var(--primary) 14%, var(--accent))",
      },
    },
    ".btn-ghost": {
      backgroundColor: "transparent",
      color: "var(--scene-content)",
      boxShadow: "none",
      "&:hover:not(:disabled):not([aria-disabled='true'])": {
        backgroundColor: "var(--line)",
      },
      "&:active:not(:disabled):not([aria-disabled='true'])": {
        backgroundColor: "color-mix(in srgb, var(--line) 85%, black)",
      },
    },
    ".btn-danger": {
      backgroundColor: "var(--error)",
      color: "var(--primary-content)",
      "&:hover:not(:disabled):not([aria-disabled='true'])": {
        backgroundColor: "color-mix(in srgb, var(--error) 90%, black)",
      },
      "&:active:not(:disabled):not([aria-disabled='true'])": {
        backgroundColor: "color-mix(in srgb, var(--error) 80%, black)",
      },
    },
  });
});