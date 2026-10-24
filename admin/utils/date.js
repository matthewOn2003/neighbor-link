// 日期工具统一放这里。约定：
//   - 后端返回的时间是 ISO 字符串（如 2026-09-29T15:49:27Z），显示时统一用 fdl / fds。
//   - 「YYYY-MM」是账期格式，用 formatMonth 显示。

// 2026-09-29T15:49:27Z -> 2026-09-29 15:49:27
export function fdl(value) {
  if (!value) return "";
  return String(value).slice(0, 19).replace("T", " ");
}

// 2026-09-29T15:49:27Z -> 2026-09-29
export function fds(value) {
  if (!value) return "";
  return String(value).slice(0, 10);
}

// 今天的日期（UTC），格式 YYYY-MM-DD，用于表单默认值和导出文件名。
export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

// 本地时区的当前账期，格式 YYYY-MM。
export function currentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// 把 YYYY-MM 或 YYYY-MM-DD 格式化成月份文字，例如 "October 2026"、"Oct 2026"。
// options 直接传给 Intl（month / year），默认 { month: "long", year: "numeric" }。
export function formatMonth(value, locale, options = { month: "long", year: "numeric" }) {
  if (!value) return "";
  const date = new Date(String(value).length === 7 ? `${value}-01T00:00:00` : `${value}T00:00:00`);
  return date.toLocaleDateString(locale, options);
}
