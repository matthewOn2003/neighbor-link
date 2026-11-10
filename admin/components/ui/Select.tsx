// TEMPORARY: plain <select> styled to match Input.
// Replace with a shared form control and delete this file.

export type SelectOption = { label: string; value: string };

// An option with value "" (such as "All" in filter panels) takes the place of the placeholder.
export function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "- Select -",
  error,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}) {
  const hasEmptyOption = options.some((option) => option.value === "");

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-subtle" htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      <select
        id={name}
        name={name}
        className={`dropdown ${error ? "border-error" : ""}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {!hasEmptyOption && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
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
