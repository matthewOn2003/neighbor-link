// TEMPORARY: plain <select> styled to match the input/field system.
// FormGuard (the form/validation package) doesn't have a select control yet.
// Once it does, replace usages of this with FormGuard's own component and
// delete this file. Tracked as a FormGuard gap — see project notes.

export type SelectOption = { label: string; value: string };

// variant="filter" is the compact control used in DataTable's filter panel.
// It renders only the given options, so an "All" option with value "" is shown as the selected default.
export function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "- Select -",
  error,
  required,
  variant = "form",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
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
        <div>
          <select
            id={name}
            name={name}
            className="dropdown"
            value={value}
            onChange={(event) => onChange(event.target.value)}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }

  return (
    <div className="field">
      <label className="field-label" htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      <select
        id={name}
        name={name}
        className={`dropdown ${error ? "input-error" : ""}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
