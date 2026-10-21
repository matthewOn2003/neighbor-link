export function Checkbox({ className = "", ...props }) {
  return (
    <input
      type="checkbox"
      className={`w-4 h-4 rounded text-primary-dark focus:ring-0 cursor-pointer accent-primary ${className}`}
      {...props}
    />
  );
}