import type { Locale } from "@/i18n";
import { createT } from "@/i18n";
import SiteFooter from "./shell/SiteFooter";
import SiteNav from "./shell/SiteNav";
import { FinalCta, HowItWorks, Hero, Intro, ManagerSection, TenantSection } from "./sections/Sections";

export default function Landing({ locale }: { locale: Locale }) {
  const t = createT(locale);
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
      >
        {t("skip_to_content")}
      </a>
      <SiteNav locale={locale} t={t} />
      <main id="main">
        <Hero locale={locale} t={t} />
        <Intro t={t} />
        <ManagerSection locale={locale} t={t} />
        <TenantSection locale={locale} t={t} />
        <HowItWorks t={t} />
        <FinalCta locale={locale} t={t} />
      </main>
      <SiteFooter locale={locale} t={t} />
    </>
  );
}
