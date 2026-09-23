import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".field": {
      display: "flex",
      flexDirection: "column",
      gap: "var(--label-gap)",
    },
    ".field-label": {
      fontSize: "0.8125rem",
      fontWeight: "600",
      color: "var(--foreground)",
    },
    ".input": {
      height: "var(--control-height)",
      width: "100%",
      padding: "0 0.875rem",
      borderRadius: "var(--input-radius)",
      border: "var(--border-width) solid var(--line)",
      backgroundColor: "var(--control-background)",
      color: "var(--foreground)",
      fontSize: "0.9375rem",
      transitionProperty: "border-color, box-shadow",
      transitionDuration: "var(--transition-duration)",
      "&::placeholder": {
        color: "var(--ink-muted)",
      },
      "&:focus": {
        outline: "none",
        borderColor: "var(--accent)",
        boxShadow: "0 0 0 var(--focus-ring-width) rgba(216, 109, 67, 0.15)",
      },
      "&:disabled": {
        cursor: "not-allowed",
        opacity: "0.5",
      },
    },
    ".input-error": {
      borderColor: "var(--error)",
      "&:focus": {
        borderColor: "var(--error)",
        boxShadow: "0 0 0 var(--focus-ring-width) rgba(174, 56, 45, 0.15)",
      },
    },
    ".field-error": {
      fontSize: "0.8125rem",
      color: "var(--error)",
    },
    ".field-hint": {
      fontSize: "0.8125rem",
      color: "var(--ink-muted)",
    },
  });
});
