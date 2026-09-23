import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".tooltip-wrap": {
      position: "relative",
      display: "inline-flex",
    },
    ".tooltip": {
      position: "absolute",
      bottom: "calc(100% + 0.5rem)",
      left: "50%",
      transform: "translateX(-50%) translateY(0.25rem)",
      whiteSpace: "nowrap",
      padding: "0.375rem 0.625rem",
      borderRadius: "0.375rem",
      backgroundColor: "var(--foreground)",
      color: "var(--panel-background)",
      fontSize: "0.75rem",
      fontWeight: "500",
      pointerEvents: "none",
      opacity: "0",
      zIndex: "60",
      transitionProperty: "opacity, transform",
      transitionDuration: "var(--transition-duration)",
    },
    ".tooltip-wrap:hover .tooltip, .tooltip-wrap:focus-within .tooltip": {
      opacity: "1",
      transform: "translateX(-50%) translateY(0)",
    },
  });
});
