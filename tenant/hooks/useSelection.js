import { useState } from "react";

export function useSelection() {
  const [selectedIds, setSelectedIds] = useState([]);

  const isSelected = (id) => selectedIds.includes(id);
  const isAllSelected = (rows) => rows.length > 0 && rows.every((r) => isSelected(r.id));

  const toggle = (id) =>
    setSelectedIds((cur) => (cur.includes(id) ? cur.filter((v) => v !== id) : [...cur, id]));

  const toggleAll = (rows) => {
    const ids = rows.map((r) => r.id);
    setSelectedIds((cur) =>
      isAllSelected(rows) ? cur.filter((id) => !ids.includes(id)) : [...new Set([...cur, ...ids])],
    );
  };

  return { selectedIds, isSelected, isAllSelected, toggle, toggleAll, clear: () => setSelectedIds([]) };
}