import plugin from "tailwindcss/plugin";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".table-wrap": {
      width: "100%",
      overflowX: "auto",
    },
    ".table": {
      width: "100%",
      fontSize: "0.875rem",
      textAlign: "left",
      borderCollapse: "separate",
      borderSpacing: "0",
      "& thead th": {
        borderBottom: "var(--border-width) solid var(--line)",
      },
      "& td, & th": {
        padding: "1rem 1.5rem",
        whiteSpace: "nowrap",
        alignContent: "start",
      },
      "& tbody tr": {
        "--row-bg": "var(--accent)",
        backgroundColor: "var(--row-bg)",
        transitionProperty: "background-color",
        transitionDuration: "var(--transition-duration)",
      },
      "& tbody tr:hover": {
        "--row-bg": "color-mix(in srgb, var(--primary) 5%, var(--accent))",
      },
      "& .sticky-left, & .sticky-right": {
        position: "sticky",
        zIndex: "1",
        backgroundColor: "var(--row-bg, var(--accent))",
        transitionProperty: "background-color",
        transitionDuration: "var(--transition-duration)",
      },
      "& .sticky-left": { left: "0" },
      "& .sticky-right": { right: "0" },
      "& thead .sticky-left, & thead .sticky-right": { zIndex: "2" },
    },
  });
});