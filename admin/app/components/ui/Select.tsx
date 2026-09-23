// TEMPORARY: plain <select> styled to match the input/field system.
// FormGuard (the form/validation package) doesn't have a select control yet.
// Once it does, replace usages of this with FormGuard's own component and
// delete this file. Tracked as a FormGuard gap — see project notes.

export type SelectOption = { label: string; value: string };

export function Select({
  label,
  name,
  value,
  onChange,
  options,
  placeholder = "Select…",
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
  return (
    <div className="field">
      <label className="field-label" htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      <select
        id={name}
        name={name}
        className={`input ${error ? "input-error" : ""}`}
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
