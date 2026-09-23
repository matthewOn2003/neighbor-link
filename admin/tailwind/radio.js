import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".radio": {
      appearance: "none",
      width: "1.25rem",
      height: "1.25rem",
      flexShrink: "0",
      borderRadius: "9999px",
      border: "var(--border-width) solid var(--line)",
      backgroundColor: "var(--control-background)",
      cursor: "pointer",
      position: "relative",
      transitionProperty: "background-color, border-color",
      transitionDuration: "var(--transition-duration)",
      "&:checked": {
        borderColor: "var(--accent)",
      },
      "&:checked::after": {
        content: '""',
        position: "absolute",
        top: "50%",
        left: "50%",
        width: "0.625rem",
        height: "0.625rem",
        borderRadius: "9999px",
        backgroundColor: "var(--accent)",
        transform: "translate(-50%, -50%)",
      },
      "&:disabled": {
        cursor: "not-allowed",
        opacity: "0.5",
      },
      "&:focus-visible": {
        outline: "var(--focus-ring-width) solid var(--accent)",
        outlineOffset: "2px",
      },
    },
    ".radio-field": {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--label-gap)",
    },
    ".radio-label": {
      fontSize: "0.9375rem",
      color: "var(--foreground)",
      userSelect: "none",
    },
  });
});
