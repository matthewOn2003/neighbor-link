import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".table-wrap": {
      width: "100%",
      overflowX: "auto",
      border: "var(--border-width) solid var(--line)",
      borderRadius: "var(--panel-radius)",
    },
    ".table": {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "0.875rem",
    },
    ".table-head": {
      backgroundColor: "var(--panel-background)",
      borderBottom: "var(--border-width) solid var(--line)",
    },
    ".table-head-cell": {
      textAlign: "left",
      padding: "0.75rem 1rem",
      fontWeight: "600",
      color: "var(--ink-muted)",
      whiteSpace: "nowrap",
    },
    ".table-row": {
      borderBottom: "var(--border-width) solid var(--line)",
      transitionProperty: "background-color",
      transitionDuration: "var(--transition-duration)",
      "&:last-child": {
        borderBottom: "none",
      },
      "&:hover": {
        backgroundColor: "var(--background)",
      },
    },
    ".table-cell": {
      padding: "0.75rem 1rem",
      color: "var(--foreground)",
      verticalAlign: "middle",
    },
    ".table-empty": {
      padding: "2.5rem 1rem",
      textAlign: "center",
      color: "var(--ink-muted)",
    },
  });
});
