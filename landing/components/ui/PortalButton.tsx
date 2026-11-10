import { portalUrl, type Portal } from "@/config/site";
import type { Locale } from "@/i18n";
import { SvgIcon } from "./Icon";

const variants = {
  primary: "btn btn-primary",
  outline: "btn btn-outline",
  light: "btn btn-light",
} as const;

export function PortalButton({
  portal,
  locale,
  label,
  variant = "primary",
  arrow = false,
  arrowClassName = "",
  className = "",
}: {
  portal: Portal;
  locale: Locale;
  label: string;
  variant?: keyof typeof variants;
  arrow?: boolean;
  arrowClassName?: string;
  className?: string;
}) {
  return (
    <a href={portalUrl(portal, locale)} className={`${variants[variant]} ${className}`.trim()}>
      {label}
      {arrow ? <SvgIcon src="/design/0e2db.svg" size={16} className={arrowClassName} /> : null}
    </a>
  );
}
