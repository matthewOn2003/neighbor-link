"use client";

import { useEffect, useState } from "react";
import en from "@/messages/en.json";
import zh from "@/messages/zh.json";

export type Locale = "en" | "zh";

const messages = { en, zh };

export function useLocale() {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const savedLocale = window.localStorage.getItem("locale");
    if (savedLocale === "en" || savedLocale === "zh") {
      // The saved browser preference is applied after hydration.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLocaleState(savedLocale);
    }
  }, []);

  function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale);
    window.localStorage.setItem("locale", nextLocale);
  }

  return { locale, setLocale, text: messages[locale] };
}