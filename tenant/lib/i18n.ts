"use client";

import { usePathname as useRawPathname, useRouter as useRawRouter } from "next/navigation";
import { defaultLocale, locales, type LocaleConfig } from "@/locales.config";
import { getLocaleFromPathname, localizePath, stripLocale } from "@/i18n/routing";
import zhMessages from "@/messages/zh.json";
import enMessages from "@/messages/en.json";

export type Locale = string;
export type Messages = Record<string, string>;
export type LocaleProperties = LocaleConfig & { messages: Messages };

const messagesByCode: Record<string, Messages> = { zh: zhMessages, en: enMessages };

export function useLocale() {
  const pathname = useRawPathname();
  const router = useRawRouter();
  const locale = getLocaleFromPathname(pathname);

  function setLocale(nextLocale: Locale) {
    if (!messagesByCode[nextLocale]) return;
    const query = typeof window === "undefined" ? "" : window.location.search;
    const hash = typeof window === "undefined" ? "" : window.location.hash;
    router.push(`${localizePath(stripLocale(pathname), nextLocale)}${query}${hash}`);
  }

  const currentLanguage = locales.find((item) => item.code === locale) ?? locales.find((item) => item.code === defaultLocale)!;
  const messages = messagesByCode[locale] ?? messagesByCode[defaultLocale];
  const localeProperties: LocaleProperties = { ...currentLanguage, messages };

  function t(key: string, params?: Record<string, string | number>) {
    const message = messages[key] ?? key;
    if (!params) return message;
    return message.replace(/\{(\w+)\}/g, (match, name) => name in params ? String(params[name]) : match);
  }

  return { locale, locales, setLocale, localeProperties, t };
}
