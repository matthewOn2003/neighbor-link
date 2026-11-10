import type { Metadata } from "next";
import Landing from "@/components/Landing";
import { createT } from "@/i18n";
import { getRequestLocale } from "@/i18n/request";

export async function generateMetadata(): Promise<Metadata> {
  const t = createT(await getRequestLocale());
  return {
    title: t("meta_title"),
    description: t("meta_description"),
    alternates: { languages: { en: "/", "zh-Hans": "/zh" } },
  };
}

export default async function Page() {
  return <Landing locale={await getRequestLocale()} />;
}
