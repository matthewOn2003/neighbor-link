"use client";

import { useRef } from "react";

export function useDragScroll() {
  const ref = useRef(null);
  const drag = useRef(null);

  const onPointerDown = (e) => {
    const el = ref.current;
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    if (el.scrollWidth <= el.clientWidth) return; // 没溢出就不用拖
    if (e.target.closest("a, button, input, select, textarea, label")) return; // 不干扰点击
    drag.current = { x: e.clientX, left: el.scrollLeft };
    el.setPointerCapture(e.pointerId);
    // el.style.cursor = "grabbing";
    el.style.userSelect = "none";
  };

  const onPointerMove = (e) => {
    if (!drag.current) return;
    ref.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };

  const end = () => {
    drag.current = null;
    if (ref.current) {
      ref.current.style.cursor = "";
      ref.current.style.userSelect = "";
    }
  };

  return { ref, onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end };
}