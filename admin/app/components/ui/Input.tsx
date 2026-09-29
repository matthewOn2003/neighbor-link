// TEMPORARY: plain <input> styled to match the input/field system.
// Same rationale as Select.tsx — replace with FormGuard's own control
// once it exists, then delete this file.

export function Input({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder,
  error,
  required,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
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
