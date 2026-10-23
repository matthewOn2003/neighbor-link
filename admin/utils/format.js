// 金额格式化：RM + 千分位，默认两位小数。
// fallback：value 为 null / undefined 时显示的文字（默认仍按 0 处理）。
export function formatMoney(value, locale, { digits = 2, fallback } = {}) {
  if (fallback !== undefined && value == null) return fallback;
  const number = Number(value || 0).toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return "RM " + number;
}

// 业务编号：prefix + 零填充到 5 位，例如 formatRef("BL", 7) -> "BL-00007"
export function formatRef(prefix, id) {
  return `${prefix}-${String(id).padStart(5, "0")}`;
}
