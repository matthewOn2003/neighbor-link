import { Icon as IconifyIcon } from "@iconify/react";

export function Icon({ name, className = "", ...rest }) {
  if (name.includes(":")) {
    return <IconifyIcon icon={name} className={className} {...rest} />;
  }

  return (
    <span className={`material-symbols-outlined ${className}`.trim()} {...rest}>
      {name}
    </span>
  );
}
