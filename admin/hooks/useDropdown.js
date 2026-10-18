"use client";

import { useRequest } from "@/hooks/useRequest";

/**
 * 按 key 向后端取下拉选项，例如 useDropdown(["property_type", "property_region"])。
 * 返回的每一项约定为 { id, <key>_display, variant }：
 * - id 是提交给后端的值（payload 用它）
 * - <key>_display 是界面上显示的文字（找不到时回退到 label，再回退到 id）
 * 这只是约定，不是强制规则：hook 会按需要去取字段，后端换了字段名也只需要改这里。
 */
export function useDropdown(keys) {
  const keyList = [...keys].sort();
  const { data, loading, error } = useRequest("/dictionary/dropdown", { keys: keyList });
  const dropdown = data?.dropdown ?? {};

  function labelOf(key, id) {
    const item = (dropdown[key] ?? []).find((option) => option.id === id);
    if (!item) return id ?? "";
    return item[`${key}_display`] ?? item.label ?? item.id;
  }

  function optionsOf(key) {
    return (dropdown[key] ?? []).map((item) => ({ value: item.id, label: labelOf(key, item.id) }));
  }

  return { dropdown, loading, error, labelOf, optionsOf };
}
