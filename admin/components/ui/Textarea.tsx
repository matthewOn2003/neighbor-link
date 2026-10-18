// TEMPORARY: plain <textarea> styled to match the input/field system.
// Same rationale as Select.tsx — replace with FormGuard's own control
// once it exists, then delete this file.

export function Textarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  required,
  rows = 4,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  rows?: number;
}) {
  return (
    <div className="field">
      <label className="field-label" htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        className={`input ${error ? "input-error" : ""}`}
        style={{ height: "auto", padding: "0.625rem 0.875rem", resize: "vertical" }}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
