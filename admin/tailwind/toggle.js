import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".toggle": {
      appearance: "none",
      position: "relative",
      width: "2.75rem",
      height: "1.5rem",
      borderRadius: "9999px",
      backgroundColor: "var(--line)",
      cursor: "pointer",
      flexShrink: "0",
      transitionProperty: "background-color",
      transitionDuration: "var(--transition-duration)",
      "&::after": {
        content: '""',
        position: "absolute",
        top: "0.125rem",
        left: "0.125rem",
        width: "1.25rem",
        height: "1.25rem",
        borderRadius: "9999px",
        backgroundColor: "var(--panel-background)",
        transitionProperty: "transform",
        transitionDuration: "var(--transition-duration)",
      },
      "&:checked": {
        backgroundColor: "var(--accent)",
      },
      "&:checked::after": {
        transform: "translateX(1.25rem)",
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
    ".toggle-field": {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--label-gap)",
    },
    ".toggle-label": {
      fontSize: "0.9375rem",
      color: "var(--foreground)",
      userSelect: "none",
    },
  });
});
