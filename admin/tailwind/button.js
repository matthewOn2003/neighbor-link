import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    /* ---------- 基础 ---------- */
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
      transitionProperty: "background-color, border-color, color, opacity, box-shadow",
      transitionDuration: "var(--transition-duration)",
      cursor: "pointer",
      "&:disabled, &[aria-disabled='true']": {
        cursor: "not-allowed",
        opacity: "0.5",
        pointerEvents: "none",
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

    /* ---------- 变体 ---------- */
    ".btn-primary": {
      backgroundColor: "var(--primary)",
      color: "var(--primary-content)",
      "&:hover:not(:disabled)": {
        backgroundColor: "var(--primary-dark)",
      },
    },
    ".btn-outline": {
      backgroundColor: "var(--accent)",
      color: "var(--scene-content)",
      borderColor: "var(--subtle)",
      "&:hover:not(:disabled)": {
        backgroundColor: "color-mix(in srgb, var(--primary) 8%, var(--accent))",
        borderColor: "color-mix(in srgb, var(--primary) 50%, var(--line))",
        color: "var(--primary)",
      },
      "&:active:not(:disabled)": {
        backgroundColor: "color-mix(in srgb, var(--primary) 14%, var(--accent))",
      },
    },
    ".btn-ghost": {
      backgroundColor: "transparent",
      color: "var(--scene-content)",
      boxShadow: "none",
      "&:hover:not(:disabled)": {
        backgroundColor: "var(--line)",
      },
    },
    ".btn-danger": {
      backgroundColor: "var(--error)",
      color: "var(--primary-content)",
      "&:hover:not(:disabled)": {
        opacity: "0.9",
      },
    },
  });
});