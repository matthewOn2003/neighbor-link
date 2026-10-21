"use client";

import { useEffect } from "react";
import { Icon } from "./Icon";
import { useLocale } from "@/i18n";

const SIZE_CLASS = {
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-6xl",
};

/**
 * 通用弹窗。size: md | lg | xl。xl 用于大面积预览（如 PDF）。
 * footer 可选，传入 JSX 即显示在底部。
 */
export function Modal({ open, title, onClose, size = "md", footer, children }) {
  const { t } = useLocale();
  useEffect(() => {
    if (!open) return undefined;
    function onKey(event) {
      if (event.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${SIZE_CLASS[size] ?? SIZE_CLASS.md} flex max-h-[calc(100vh-4rem)] flex-col`}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button type="button" className="text-subtle hover:text-scene-content" aria-label={t("close")} onClick={onClose}>
            <Icon name="close" className="text-xl" />
          </button>
        </div>
        <div className="modal-body min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer ? <div className="modal-footer">{footer}</div> : null}
      </div>
    </div>
  );
}
