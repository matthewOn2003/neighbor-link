"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type ToastVariant = "success" | "error" | "info";

type ToastItem = {
  id: number;
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION_MS = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "info") => {
      const id = idRef.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => remove(id), DURATION_MS);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        className="fixed top-safe left-1/2 z-[100] flex -translate-x-1/2 flex-col items-center gap-2 pt-4"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium shadow-lg"
            style={{
              background: toast.variant === "error" ? "var(--error)" : "var(--foreground)",
              color: "var(--panel-background)",
              boxShadow: "var(--panel-shadow)",
            }}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * useToast — returns { success, error, info }.
 * Kept as the only integration point with the rest of the app so that if
 * Toast is later extracted into its own npm package, only this file (and
 * the provider mount in layout.tsx) needs to change.
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return {
    success: (message: string) => context.show(message, "success"),
    error: (message: string) => context.show(message, "error"),
    info: (message: string) => context.show(message, "info"),
  };
}
