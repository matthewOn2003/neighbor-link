import plugin from "tailwindcss/plugin";

// 隐藏滚动条但保留滚动能力，不占位
export default plugin(function ({ addComponents }) {
  addComponents({
    ".scrollbar-hidden": {
      scrollbarWidth: "none",

      "&::-webkit-scrollbar": {
        display: "none",
      },
    },
  });
});
