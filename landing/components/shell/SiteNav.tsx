import { localizePath, type Locale, type T } from "@/i18n";
import { siteLinks } from "@/config/site";
import { PortalButton, SvgIcon } from "@/components/ui";
import MobileMenu from "./MobileMenu";

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
          <SvgIcon src="/design/bfade.svg" size={26} />
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
          <PortalButton portal="tenant" locale={locale} label={t("nav_tenant_portal")} variant="outline" className="h-10 px-4 text-sm" />
          <PortalButton portal="admin" locale={locale} label={t("nav_admin_portal")} className="h-10 px-4 text-sm" />
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <a
            href={localizePath("/", other)}
            hrefLang={other}
            lang={other}
            aria-label={t("lang_other_aria")}
            className="rounded-lg px-2 py-2 text-sm font-medium text-muted"
          >
            {t("lang_other_label")}
          </a>
            <MobileMenu
            menuLabel={t("nav_menu")}
            openLabel={t("nav_open_menu")}
            anchors={anchors}
            tenantLabel={t("nav_tenant_portal")}
            adminLabel={t("nav_admin_portal")}
            locale={locale}
          />
        </div>
      </div>
    </header>
  );
}
