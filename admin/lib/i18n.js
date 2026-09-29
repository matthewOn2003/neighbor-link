"use client";

import { useEffect, useState } from "react";
import { locales } from "@/locales.config";
import zhMessages from "@/messages/zh.json";
import enMessages from "@/messages/en.json";

const messagesByFile = { "zh.json": zhMessages, "en.json": enMessages };

const configuredLocales = getConfiguredLocales();
const messagesByCode = Object.fromEntries(
  configuredLocales.map((locale) => [locale.code, messagesByFile[locale.file]]),
);

/** @returns {any[]} */
function getConfiguredLocales() {
  try {
    const publicLocales = process.env.NEXT_PUBLIC_LOCALES;
    return publicLocales ? JSON.parse(publicLocales) : locales;
  } catch {
    return locales;
  }
}

export function useLocale() {
  const defaultLocale = configuredLocales[0]?.code ?? "en";
  const [locale, setLocaleState] = useState(defaultLocale);

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("locale");
    if (savedLocale && configuredLocales.some((item) => item.code === savedLocale)) {
      // The saved browser preference is applied after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(savedLocale);
    }
  }, []);

  function setLocale(nextLocale) {
    if (!configuredLocales.some((item) => item.code === nextLocale)) return;
    setLocaleState(nextLocale);
    window.localStorage.setItem("locale", nextLocale);
  }

  const currentIndex = configuredLocales.findIndex((item) => item.code === locale);
  const currentLanguage = configuredLocales[currentIndex] ?? configuredLocales[0];
  const localeProperties = {
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
