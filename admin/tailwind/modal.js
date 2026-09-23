import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".modal-overlay": {
      position: "fixed",
      inset: "0",
      backgroundColor: "rgba(24, 50, 46, 0.4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--page-padding-inline)",
      zIndex: "50",
    },
    ".modal": {
      width: "100%",
      maxWidth: "32rem",
      maxHeight: "calc(100vh - 4rem)",
      overflowY: "auto",
      backgroundColor: "var(--panel-background)",
      borderRadius: "var(--panel-radius)",
      boxShadow: "var(--panel-shadow)",
      border: "var(--border-width) solid var(--panel-border)",
    },
    ".modal-header": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1.5rem 1.5rem 1rem",
    },
    ".modal-title": {
      fontWeight: "700",
      fontSize: "1.125rem",
      color: "var(--foreground)",
    },
    ".modal-body": {
      padding: "0 1.5rem 1.5rem",
      color: "var(--ink-muted)",
      fontSize: "0.9375rem",
    },
    ".modal-footer": {
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
      padding: "1rem 1.5rem 1.5rem",
    },
  });
});
