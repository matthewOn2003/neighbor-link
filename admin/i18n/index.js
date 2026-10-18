"use client";

import { useEffect, useState } from "react";
import { locales } from "@/i18n/config";
import zhMessages from "@/i18n/messages/zh.json";
import enMessages from "@/i18n/messages/en.json";

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
    locales: configuredLocales,
    setLocale,
    localeProperties,
    t,
  };
}
