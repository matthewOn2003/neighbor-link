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
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  variant?: "form" | "filter";
}) {
  if (variant === "filter") {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-subtle" htmlFor={name}>
          {label}
        </label>
        <input
          id={name}
          name={name}
          type={type}
          className="w-full rounded-lg border border-line/60 bg-accent px-3 text-sm text-scene-content placeholder:text-subtle/60 outline-none transition-colors focus:border-primary"
          style={{ height: "var(--control-height)" }}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="field">
      <label className="field-label" htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`input ${error ? "input-error" : ""}`}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
