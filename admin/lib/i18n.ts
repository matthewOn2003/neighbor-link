"use client";

import { useEffect, useState } from "react";
import { locales, LocaleConfig } from "@/locales.config";

export type Locale = string;
export type Messages = Record<string, string>;
export type LocaleProperties = LocaleConfig & { messages: Messages };

const configuredLocales = getConfiguredLocales();
const messagesByCode = Object.fromEntries(
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  configuredLocales.map((locale) => [locale.code, require(`../messages/${locale.file}`) as Messages]),
) as Record<string, Messages>;

function getConfiguredLocales(): LocaleConfig[] {
  try {
    const publicLocales = process.env.NEXT_PUBLIC_LOCALES;
    return publicLocales ? (JSON.parse(publicLocales) as LocaleConfig[]) : locales;
  } catch {
    return locales;
  }
}

export function useLocale() {
  const defaultLocale = configuredLocales[0]?.code ?? "en";
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("locale");
    if (savedLocale && configuredLocales.some((item) => item.code === savedLocale)) {
      // The saved browser preference is applied after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(savedLocale);
    }
  }, []);

  function setLocale(nextLocale: Locale) {
    if (!configuredLocales.some((item) => item.code === nextLocale)) return;
    setLocaleState(nextLocale);
    window.localStorage.setItem("locale", nextLocale);
  }

  const currentIndex = configuredLocales.findIndex((item) => item.code === locale);
  const currentLanguage = configuredLocales[currentIndex] ?? configuredLocales[0];
  const localeProperties: LocaleProperties = {
    ...currentLanguage,
    messages: messagesByCode[locale] ?? {},
  };

  return {
    locale,
    locales: configuredLocales,
    setLocale,
    localeProperties,
  };
}
