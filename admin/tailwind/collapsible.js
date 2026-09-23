import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".collapsible": {
      borderRadius: "var(--panel-radius)",
      border: "var(--border-width) solid var(--panel-border)",
      overflow: "hidden",
    },
    ".collapsible-trigger": {
      display: "flex",
      width: "100%",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "0.5rem",
      padding: "0.875rem 1rem",
      backgroundColor: "var(--panel-background)",
      color: "var(--foreground)",
      fontWeight: "600",
      fontSize: "0.9375rem",
      cursor: "pointer",
      "&:focus-visible": {
        outline: "var(--focus-ring-width) solid var(--accent)",
        outlineOffset: "-2px",
      },
    },
    ".collapsible-icon": {
      transitionProperty: "transform",
      transitionDuration: "var(--transition-duration)",
      flexShrink: "0",
    },
    ".collapsible-icon-open": {
      transform: "rotate(180deg)",
    },
    ".collapsible-content": {
      overflow: "hidden",
      transitionProperty: "grid-template-rows",
      transitionDuration: "var(--transition-duration)",
      display: "grid",
      gridTemplateRows: "0fr",
    },
    ".collapsible-content-open": {
      gridTemplateRows: "1fr",
    },
    ".collapsible-content-inner": {
      overflow: "hidden",
      padding: "0 1rem 1rem",
      color: "var(--ink-muted)",
      fontSize: "0.875rem",
    },
  });
});
