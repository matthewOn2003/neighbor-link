import type { Locale, T } from "@/i18n";
import { portalUrl, siteLinks } from "@/config/site";
import { SvgIcon } from "@/components/ui";

export default function SiteFooter({ locale, t }: { locale: Locale; t: T }) {
  return (
    <footer className="bg-paper text-ink">
      <div className="mx-auto max-w-site px-6 pb-8 pt-14 md:px-8 md:pt-16">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:gap-12">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <SvgIcon src="/design/bfade.svg" size={26} />
              <span className="text-2xl font-semibold tracking-tight">{t("brand_name")}</span>
            </div>
            <p className="mt-5 text-sm text-muted">{t("ft_tagline")}</p>
          </div>

          <div className="flex flex-col gap-10 whitespace-nowrap sm:flex-row sm:gap-16">
            <div className="flex flex-col gap-4 text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">{t("ft_explore")}</p>
              <a href={siteLinks.platform} className="hover:underline underline-offset-4">{t("ft_platform")}</a>
              <a href={siteLinks.managers} className="hover:underline underline-offset-4">{t("ft_managers")}</a>
              <a href={siteLinks.tenants} className="hover:underline underline-offset-4">{t("ft_tenants")}</a>
            </div>

            <div className="flex flex-col gap-4 text-sm">
              <p className="text-[10px] font-semibold uppercase tracking-[0.06em] text-muted">{t("ft_workspace")}</p>
              <a href={portalUrl("admin", locale)} className="font-semibold hover:underline underline-offset-4">
                {t("cta_admin")} ↗
              </a>
              <a href={portalUrl("tenant", locale)} className="hover:underline underline-offset-4">
                {t("cta_tenant")} ↗
              </a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line pt-6 text-xs text-muted md:flex-row md:justify-between md:gap-4">
          <p>{t("ft_copyright", { year: 2026 })}</p>
          <p>{t("ft_slogan")}</p>
        </div>
      </div>
    </footer>
  );
}
