import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".panel": {
      padding: "1.5rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      backgroundColor: "var(--accent)",
      borderRadius: "0.75rem",
      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      overflow: "hidden",
      "@media (min-width: 640px)": {
        padding: "2.25rem",
      },
    },
  });
});