// TEMPORARY: plain <input> styled to match the input/field system.
// Replace with a shared form control and delete this file.

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
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-subtle" htmlFor={name}>
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`w-full rounded-lg border bg-accent px-3 text-sm text-scene-content placeholder:text-primary/10 outline-none transition-colors focus:border-primary ${error ? "border-error" : "border-line/60"}`}
        style={{ height: "var(--control-height)" }}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span className="field-error">{error}</span>}
    </div>
  );
}
