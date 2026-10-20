import { Icon } from "@/components/ui/Icon";

const filterInput =
  "h-[var(--control-height)] w-full rounded-[var(--input-radius)] border border-line bg-accent pl-3.5 pr-9 text-sm text-scene-content outline-none transition-[border-color,box-shadow] duration-[var(--transition-duration)] hover:border-primary/45 focus:border-primary focus:shadow-[0_0_0_var(--focus-ring-width)_rgba(216,109,67,0.15)] [&::-webkit-calendar-picker-indicator]:hidden";

const formInput = "input pr-9 [&::-webkit-calendar-picker-indicator]:hidden";

// value and the onChange argument are "YYYY-MM-DD" strings, or "" when no date is picked.
// variant="filter" is the compact control used in DataTable's filter panel.
export function DatePicker({
  label,
  name,
  value,
  onChange,
  min,
  max,
  error,
  required,
  variant = "form",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
  required?: boolean;
  variant?: "form" | "filter";
}) {
  const input = (
    <div className="relative">
      <input
        id={name}
        name={name}
        type="date"
        className={variant === "filter" ? filterInput : `${formInput} ${error ? "input-error" : ""}`}
        value={value}
        min={min}
        max={max}
        onClick={(event) => event.currentTarget.showPicker?.()}
        onChange={(event) => onChange(event.target.value)}
      />
      <Icon
        name="calendar_month"
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-lg text-subtle"
      />
    </div>
  );

  if (variant === "filter") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-subtle" htmlFor={name}>
          {label}
        </label>
        {input}
      </div>
    );
  }

  return (
    <div className="field">
      <label className="field-label" htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      {input}
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
