"use client";

// 金额格式化：与 admin 保持一致的 RM 两位小数展示
export const money = (value, locale) =>
  `RM ${Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
