import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".panel": {
      padding: "2rem",
      display: "flex",
      flexDirection: "column",
      gap: "1.5rem",
      backgroundColor: "var(--accent)",
      borderRadius: "0.75rem",
      boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      overflow: "hidden",
    },
  });
});
