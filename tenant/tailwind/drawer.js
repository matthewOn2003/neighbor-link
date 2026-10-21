import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".drawer-overlay": {
      position: "fixed",
      inset: "0",
      backgroundColor: "rgba(24, 50, 46, 0.4)",
      zIndex: "40",
      transitionProperty: "opacity",
      transitionDuration: "var(--transition-duration)",
    },
    ".drawer": {
      position: "fixed",
      top: "0",
      bottom: "0",
      right: "0",
      width: "min(24rem, 100vw)",
      backgroundColor: "var(--panel-background)",
      boxShadow: "var(--panel-shadow)",
      zIndex: "50",
      display: "flex",
      flexDirection: "column",
      transitionProperty: "transform",
      transitionDuration: "var(--transition-duration)",
      paddingTop: "env(safe-area-inset-top, 0px)",
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    },
    ".drawer-left": {
      right: "auto",
      left: "0",
    },
    ".drawer-header": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "1.25rem var(--page-padding-inline)",
      borderBottom: "var(--border-width) solid var(--line)",
    },
    ".drawer-title": {
      fontWeight: "700",
      fontSize: "1.0625rem",
      color: "var(--foreground)",
    },
    ".drawer-body": {
      flex: "1",
      overflowY: "auto",
      padding: "var(--page-padding-inline)",
    },
    ".drawer-footer": {
      padding: "1rem var(--page-padding-inline)",
      borderTop: "var(--border-width) solid var(--line)",
      display: "flex",
      justifyContent: "flex-end",
      gap: "0.75rem",
    },
  });
});
