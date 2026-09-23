import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".checkbox": {
      appearance: "none",
      width: "1.25rem",
      height: "1.25rem",
      flexShrink: "0",
      borderRadius: "0.25rem",
      border: "var(--border-width) solid var(--line)",
      backgroundColor: "var(--control-background)",
      cursor: "pointer",
      position: "relative",
      transitionProperty: "background-color, border-color",
      transitionDuration: "var(--transition-duration)",
      "&:checked": {
        backgroundColor: "var(--accent)",
        borderColor: "var(--accent)",
      },
      "&:checked::after": {
        content: '""',
        position: "absolute",
        left: "0.375rem",
        top: "0.15rem",
        width: "0.3rem",
        height: "0.6rem",
        border: "solid var(--panel-background)",
        borderWidth: "0 2px 2px 0",
        transform: "rotate(45deg)",
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
    ".checkbox-field": {
      display: "inline-flex",
      alignItems: "center",
      gap: "var(--label-gap)",
    },
    ".checkbox-label": {
      fontSize: "0.9375rem",
      color: "var(--foreground)",
      userSelect: "none",
    },
  });
});
