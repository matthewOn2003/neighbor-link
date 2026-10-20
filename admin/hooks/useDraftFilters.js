"use client";

import { useState } from "react";

// draft 是筛选面板里正在编辑的值，applied 是已经应用、用于请求列表的值。
export function useDraftFilters(initial) {
  const [draft, setDraft] = useState(initial);
  const [applied, setApplied] = useState(initial);

  return {
    draft,
    setDraft,
    applied,
    apply: () => setApplied(draft),
    clear: (key) => {
      setDraft((current) => ({ ...current, [key]: "" }));
      setApplied((current) => ({ ...current, [key]: "" }));
    },
    reset: () => {
      setDraft(initial);
      setApplied(initial);
    },
  };
}
