import plugin from "tailwindcss/plugin";

const chevron =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.25' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")";

export default plugin(function ({ addComponents }) {
  addComponents({
    ".dropdown": {
      height: "var(--control-height)",
      width: "100%",
      minWidth: "0",
      padding: "0 2.25rem 0 0.875rem",
      borderRadius: "var(--input-radius)",
      border: "var(--border-width) solid var(--line)",
      backgroundColor: "var(--accent)",
      backgroundImage: chevron,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "right 0.75rem center",
      backgroundSize: "1rem",
      // color: "var(--subtle)",
      fontSize: "0.875rem",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      appearance: "none",
      cursor: "pointer",
      transitionProperty: "border-color",
      transitionDuration: "var(--transition-duration)",

      "&:hover:not(:disabled)": {
        borderColor: "color-mix(in srgb, var(--primary) 45%, var(--line))",
      },
      "&:focus": {
        outline: "none",
        borderColor: "var(--primary)",
      },
      "&:disabled": {
        cursor: "not-allowed",
        opacity: "0.55",
        backgroundColor: "var(--accent)",
      },
      "&:required:invalid": {
        // color: "var(--subtle)",
      },
    },

    // 支持 base-select 的浏览器：自定义弹出层
    "@supports (appearance: base-select)": {
      ".dropdown, .dropdown::picker(select)": {
        appearance: "base-select",
      },
      ".dropdown": {
        backgroundImage: "none",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 0.75rem 0 0.875rem",
      },
      ".dropdown::picker-icon": {
        content: '""',
        width: "1rem",
        height: "1rem",
        backgroundImage: chevron,
        backgroundSize: "1rem",
        transitionProperty: "rotate",
        transitionDuration: "var(--transition-duration)",
      },
      ".dropdown:open::picker-icon": {
        rotate: "180deg",
      },
      ".dropdown::picker(select)": {
        marginTop: "0.25rem",
        padding: "0.25rem",
        border: "var(--border-width) solid var(--line)",
        borderRadius: "var(--input-radius)",
        backgroundColor: "var(--accent)",
        maxHeight: "18rem",
        // 隐藏弹出层滚动条，仍可滚动
        scrollbarWidth: "none",
      },
      ".dropdown option": {
        display: "flex",
        alignItems: "center",
        padding: "0.75rem 0.75rem",
        // borderRadius: "calc(var(--input-radius) - 2px)",
        fontSize: "0.875rem",
        // color: "var(--subtle)",
        cursor: "pointer",
      },
      ".dropdown option::checkmark": {
        display: "none",
      },
      ".dropdown option:hover, .dropdown option:focus-visible": {
        backgroundColor: "color-mix(in srgb, var(--primary) 5%, var(--accent))",
        outline: "none",
      },
      ".dropdown option:checked": {
        backgroundColor: "color-mix(in srgb, var(--primary) 10%, transparent)",
        color: "var(--primary)",
        // fontWeight: "600",
      },
      ".dropdown option[disabled]": {
        color: "var(--subtle)",
        cursor: "not-allowed",
      },
    },
  });
});