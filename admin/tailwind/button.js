import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".btn": {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      height: "var(--button-height)",
      padding: "0 1.25rem",
      borderRadius: "var(--button-radius)",
      fontWeight: "600",
      fontSize: "0.9375rem",
      border: "var(--border-width) solid transparent",
      transitionProperty: "background-color, border-color, color, opacity",
      transitionDuration: "var(--transition-duration)",
      cursor: "pointer",
      "&:disabled": {
        cursor: "not-allowed",
        opacity: "0.5",
      },
      "&:focus-visible": {
        outline: "var(--focus-ring-width) solid var(--accent)",
        outlineOffset: "2px",
      },
    },
    ".btn-primary": {
      backgroundColor: "var(--accent)",
      color: "var(--panel-background)",
      "&:hover:not(:disabled)": {
        backgroundColor: "var(--accent-dark)",
      },
    },
    ".btn-secondary": {
      backgroundColor: "var(--panel-background)",
      color: "var(--foreground)",
      borderColor: "var(--line)",
      "&:hover:not(:disabled)": {
        borderColor: "var(--accent)",
      },
    },
    ".btn-ghost": {
      backgroundColor: "transparent",
      color: "var(--foreground)",
      "&:hover:not(:disabled)": {
        backgroundColor: "var(--line)",
      },
    },
    ".btn-danger": {
      backgroundColor: "var(--error)",
      color: "var(--panel-background)",
      "&:hover:not(:disabled)": {
        opacity: "0.9",
      },
    },
    ".btn-sm": {
      height: "2.25rem",
      padding: "0 0.875rem",
      fontSize: "0.8125rem",
    },
    ".btn-lg": {
      height: "3.25rem",
      padding: "0 1.75rem",
      fontSize: "1rem",
    },
  });
});
