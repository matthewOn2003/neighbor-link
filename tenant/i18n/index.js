"use client";

import { usePathname as useRawPathname, useRouter as useRawRouter } from "next/navigation";
import { locales } from "@/i18n/config";
import { getLocaleFromPathname, localizePath, stripLocale } from "@/i18n/routing";
import zhMessages from "@/i18n/messages/zh.json";
import enMessages from "@/i18n/messages/en.json";

const messagesByFile = { "zh.json": zhMessages, "en.json": enMessages };

const messagesByCode = Object.fromEntries(
  locales.map((locale) => [locale.code, messagesByFile[locale.file]]),
);

export function useLocale() {
  const rawPathname = useRawPathname();
  const router = useRawRouter();
  const locale = getLocaleFromPathname(rawPathname);

  /** Switching language navigates to the same page under the other locale's URL prefix. */
  function setLocale(nextLocale) {
    if (!messagesByCode[nextLocale]) return;
    const query = window.location.search;
    const hash = window.location.hash;
    router.push(`${localizePath(stripLocale(rawPathname), nextLocale)}${query}${hash}`);
  }

  const currentLanguage = locales.find((item) => item.code === locale) ?? locales[0];
  const messages = messagesByCode[locale] ?? {};
  const localeProperties = {
    ...currentLanguage,
    messages,
  };

  /** Translates a flat key; `{name}` placeholders are filled from `params`. */
  function t(key, params) {
    const message = messages[key] ?? key;
    if (!params) return message;
    return message.replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match));
  }

  return {
    locale,
    locales,
    setLocale,
    localeProperties,
    t,
  };
}
