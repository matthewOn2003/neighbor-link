"use client";

import { useApiRequest } from "@/hooks/useApiRequest";

/**
 * Load backend-managed dropdown options.
 * Normalize each option to { value, label, variant } while accepting legacy
 * id/<key>_display fields during the API transition.
 */
export function useDropdown(keys) {
  const keyList = [...keys].sort();
  const { data, loading, error } = useApiRequest("/dictionary/dropdown", { keys: keyList });
  const dropdown = data?.dropdown ?? {};

  function labelOf(key, value) {
    const item = (dropdown[key] ?? []).find((option) => (option.value ?? option.id) === value);
    if (!item) return value ?? "";
    return item.label ?? item[key + "_display"] ?? item.id ?? value ?? "";
  }

  function optionsOf(key) {
    return (dropdown[key] ?? []).map((item) => ({
      value: item.value ?? item.id,
      label: item.label ?? item[key + "_display"] ?? item.id,
      variant: item.variant ?? "",
    }));
  }

  return { dropdown, loading, error, labelOf, optionsOf };
}
