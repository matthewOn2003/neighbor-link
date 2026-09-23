import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents, addUtilities }) {
  addUtilities({
    "@keyframes skeleton-pulse": {
      "0%, 100%": { opacity: "1" },
      "50%": { opacity: "0.5" },
    },
  });
  addComponents({
    ".skeleton": {
      backgroundColor: "var(--line)",
      borderRadius: "0.375rem",
      animation: "skeleton-pulse 1.5s ease-in-out infinite",
    },
    ".skeleton-text": {
      height: "0.875rem",
      borderRadius: "0.25rem",
    },
    ".skeleton-title": {
      height: "1.25rem",
      width: "40%",
      borderRadius: "0.25rem",
    },
    ".skeleton-avatar": {
      width: "2.5rem",
      height: "2.5rem",
      borderRadius: "9999px",
    },
    ".skeleton-row": {
      height: "var(--control-height)",
      width: "100%",
      borderRadius: "var(--input-radius)",
    },
  });
});
