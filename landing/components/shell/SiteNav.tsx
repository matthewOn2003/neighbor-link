import { localizePath, type Locale, type T } from "@/i18n";
import { portalUrl, siteLinks } from "@/config/site";
import { Icon } from "@/components/ui";

export default function SiteNav({ locale, t }: { locale: Locale; t: T }) {
  const other: Locale = locale === "en" ? "zh" : "en";
  const anchors = [
    { href: siteLinks.platform, label: t("nav_platform") },
    { href: siteLinks.managers, label: t("nav_managers") },
    { href: siteLinks.tenants, label: t("nav_tenants") },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper">
      <div className="mx-auto flex h-[76px] max-w-site items-center justify-between gap-6 px-6 md:h-16 md:px-8">
        <a href={localizePath("/", locale)} className="flex items-center gap-2.5 rounded-lg">
          <img src="/brand/logo.png" alt="" width={28} height={28} className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-tight">{t("brand_name")}</span>
        </a>

        <nav aria-label={t("nav_label")} className="hidden items-center gap-8 lg:flex">
          {anchors.map((item) => (
            <a key={item.href} href={item.href} className="whitespace-nowrap text-sm text-ink hover:underline hover:underline-offset-4">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={localizePath("/", other)}
            hrefLang={other}
            lang={other}
            aria-label={t("lang_other_aria")}
            className="rounded-lg px-2 py-2 text-sm font-medium text-muted hover:text-ink"
          >
            {t("lang_other_label")}
          </a>
        </div>

        <div className="lg:hidden">
          <input id="mobile-nav-toggle" type="checkbox" className="peer sr-only" />
          <label
            htmlFor="mobile-nav-toggle"
            aria-label={t("nav_toggle")}
            className="relative z-[60] flex cursor-pointer items-center rounded-lg px-1 py-2 text-ink peer-focus-visible:ring-2 peer-focus-visible:ring-lavender"
          >
            <Icon name="menu" className="mobile-nav-icon-menu" />
            <Icon name="close" className="mobile-nav-icon-close" />
          </label>
          <label
            htmlFor="mobile-nav-toggle"
            aria-hidden="true"
            className="invisible fixed inset-0 z-40 bg-ink/30 opacity-0 transition-[opacity,visibility] duration-300 peer-checked:visible peer-checked:opacity-100"
          />
          <aside className="invisible fixed inset-y-0 right-0 z-50 flex w-72 max-w-[85vw] translate-x-full flex-col gap-1 bg-paper px-6 pb-8 pt-20 shadow-xl transition-[transform,visibility] duration-300 ease-out peer-checked:visible peer-checked:translate-x-0">
            <a
              href={localizePath("/", other)}
              hrefLang={other}
              lang={other}
              aria-label={t("lang_other_aria")}
              className="rounded-lg px-3 py-3 text-base font-medium text-muted hover:bg-lavender"
            >
              {t("lang_other_label")}
            </a>
            {anchors.map((item) => (
              <a key={item.href} href={item.href} className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-lavender">
                {item.label}
              </a>
            ))}
          </aside>
        </div>
      </div>
    </header>
  );
}
