import { Icon } from "@/components/ui/Icon";

const dateInput =
  "h-[var(--control-height)] w-full rounded-lg border bg-accent pl-3 pr-9 text-sm text-scene-content outline-none transition-colors focus:border-primary [&::-webkit-calendar-picker-indicator]:hidden";

// value and the onChange argument are "YYYY-MM-DD" strings, or "" when no date is picked.
export function DatePicker({
  label,
  name,
  value,
  onChange,
  min,
  max,
  error,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-subtle" htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type="date"
          className={`${dateInput} ${error ? "border-error" : "border-line/60"}`}
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
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
