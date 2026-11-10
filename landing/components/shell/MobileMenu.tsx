import { portalUrl } from "@/config/site";
import type { Locale } from "@/i18n";
import { Icon } from "@/components/ui";

// Native <details> keeps the mobile menu working without client JavaScript.
export default function MobileMenu({
  menuLabel,
  openLabel,
  anchors,
  tenantLabel,
  adminLabel,
  locale,
}: {
  menuLabel: string;
  openLabel: string;
  anchors: { href: string; label: string }[];
  tenantLabel: string;
  adminLabel: string;
  locale: Locale;
}) {
  return (
    <details className="group relative">
      <summary
        aria-label={openLabel}
        className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-1 py-2 text-sm font-medium text-ink [&::-webkit-details-marker]:hidden"
      >
        {menuLabel}
        <Icon name="menu" className="group-open:hidden" />
        <Icon name="close" className="hidden group-open:inline-block" />
      </summary>
      <div className="absolute right-0 top-12 z-50 flex w-72 flex-col gap-1 rounded-xl border border-line bg-white p-3 shadow-lg">
        {anchors.map((item) => (
          <a key={item.href} href={item.href} className="rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-lavender">
            {item.label}
          </a>
        ))}
        <a href={portalUrl("tenant", locale)} className="mt-2 rounded-lg border border-line px-3 py-2.5 text-center text-sm font-semibold text-ink">
          {tenantLabel}
        </a>
        <a href={portalUrl("admin", locale)} className="rounded-lg bg-night px-3 py-2.5 text-center text-sm font-semibold text-white">
          {adminLabel}
        </a>
      </div>
    </details>
  );
}
