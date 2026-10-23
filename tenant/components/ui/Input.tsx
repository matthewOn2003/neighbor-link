import type { ReactNode } from "react";

// TEMPORARY: plain <input> styled to match the input/field system.
// Same rationale as Select.tsx — replace with FormGuard's own control
// once it exists, then delete this file.

// variant="filter" is the compact control used in DataTable's filter panel.
export function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  required,
  variant = "form",
  className,
  disabled,
  readOnly,
  min,
  max,
  step,
  autoComplete,
  icon,
  hideLabel,
}: {
  label: string;
  name: string;
  value: string;
  onChange?: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  variant?: "form" | "filter";
  className?: string;
  disabled?: boolean;
  readOnly?: boolean;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  autoComplete?: string;
  // Material Symbols icon name, rendered inside the field's left edge.
  icon?: string;
  // Visually hide the label (still available to screen readers).
  hideLabel?: boolean;
}) {
  const labelClass = hideLabel ? "sr-only" : undefined;

  const iconNode: ReactNode = icon ? (
    <span
      aria-hidden="true"
      className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-subtle"
    >
      {icon}
    </span>
  ) : null;

  const controlProps = {
    id: name,
    name,
    type,
    value,
    placeholder,
    disabled,
    readOnly,
    min,
    max,
    step,
    autoComplete,
    required,
    onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
      onChange?.(event.target.value),
  };

  if (variant === "filter") {
    return (
      <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>
        <label
          className={labelClass ?? "text-xs font-semibold text-subtle"}
          htmlFor={name}
        >
          {label}
        </label>
        <div className="relative">
          {iconNode}
          <input
            {...controlProps}
            className={`w-full rounded-lg border border-line/60 bg-accent px-3 text-sm text-scene-content placeholder:text-primary/10 outline-none transition-colors focus:border-primary disabled:cursor-not-allowed disabled:opacity-55 ${icon ? "pl-11" : ""
              }`}
            style={{ height: "var(--control-height)" }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`field ${className ?? ""}`}>
      <label className={labelClass ?? "field-label"} htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      <div className="relative">
        {iconNode}
        <input
          {...controlProps}
          className={`input ${error ? "input-error" : ""} ${icon ? "pl-11" : ""}`}
        />
      </div>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}