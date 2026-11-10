import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { createT } from "@/i18n";

const locale = "en" as const;

export function generateMetadata(): Metadata {
  const t = createT(locale);
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: { languages: { en: "/", "zh-Hans": "/zh" } },
  };
}

export default function Page() {
  return <Landing locale={locale} />;
}