"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { Icon } from "./Icon";

// Two states only: a success (green) or a failure (red). Keep this file identical in admin and tenant.
type ToastVariant = "success" | "error";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
  leaving: boolean;
};

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

// Failures stay a little longer so they can be read.
const DURATION_MS: Record<ToastVariant, number> = { success: 3000, error: 4500 };
const EXIT_MS = 200;
const MAX_VISIBLE = 3;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  // Play the exit animation first, then remove the toast from the list.
  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, EXIT_MS);
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = ++idRef.current;
      setToasts((current) => [...current.slice(-(MAX_VISIBLE - 1)), { id, message, variant, leaving: false }]);
      window.setTimeout(() => dismiss(id), DURATION_MS[variant]);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex flex-col items-center gap-2 px-4 pt-[calc(env(safe-area-inset-top)+1rem)]" aria-live="polite">
        {toasts.map((toast) => {
          const success = toast.variant === "success";
          return (
            <button
              key={toast.id}
              type="button"
              role="status"
              onClick={() => dismiss(toast.id)}
              className={`pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border bg-[#1c1d29]/95 px-4 py-3 text-left text-sm font-semibold text-white shadow-2xl shadow-black/40 backdrop-blur-xl ${
                success ? "border-emerald-400/40" : "border-red-400/40"
              } ${toast.leaving ? "animate-toast-out" : "animate-toast-in"}`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                  success ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/20 text-red-300"
                }`}
              >
                <Icon name={success ? "check_circle" : "error"} className="text-[18px]" />
              </span>
              <span className="min-w-0 flex-1 break-words">{toast.message}</span>
            </button>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * useToast returns show(message, variant) plus success(message) and error(message).
 * Kept as the only integration point with the rest of the app.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return {
    show: context.show,
    success: (message: string) => context.show(message, "success"),
    error: (message: string) => context.show(message, "error"),
  };
}
