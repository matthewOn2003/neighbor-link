export function Icon({ name, className = "", ...rest }) {
  return (
    <span className={`material-symbols-outlined ${className}`.trim()} {...rest}>
      {name}
    </span>
  );
}
