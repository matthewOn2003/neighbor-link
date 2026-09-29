import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".table-wrap": {
      width: "100%",
      overflowX: "auto",
      overscrollBehaviorX: "contain",
      border: "var(--border-width) solid var(--line)",
      borderRadius: "4px",
    },
    ".table": {
      width: "100%",
      borderCollapse: "collapse",
      fontSize: "0.875rem",
    },
    ".table-head": {
      backgroundColor: "var(--primary)",
      borderBottom: "var(--border-width) solid var(--line)",
    },
    ".table-head-cell": {
      textAlign: "left",
      padding: "0.75rem 1rem",
      fontWeight: "600",
      color: "var(--primary-content)",
      whiteSpace: "nowrap",
    },
    ".table-row": {
      borderBottom: "var(--border-width) solid var(--line)",
      transitionProperty: "background-color",
      transitionDuration: "var(--transition-duration)",
      backgroundColor: "var(--panel-background)",
      "&:nth-child(even)": {
        backgroundColor: "color-mix(in srgb, var(--foreground) 4%, var(--panel-background))",
      },
      "&:last-child": {
        borderBottom: "none",
      },
      "&:hover": {
        backgroundColor: "color-mix(in srgb, var(--primary) 10%, var(--panel-background))",
      },
    },
    ".table-cell": {
      padding: "0.75rem 1rem",
      color: "var(--foreground)",
      verticalAlign: "middle",
      whiteSpace: "nowrap",
    },
    // Opt-in: allow long text columns (notes, address...) to wrap.
    ".table-cell-wrap": {
      whiteSpace: "normal",
      minWidth: "12rem",
      maxWidth: "24rem",
    },
    ".table-empty": {
      padding: "2.5rem 1rem",
      textAlign: "center",
      color: "var(--ink-muted)",
    },
  });
});