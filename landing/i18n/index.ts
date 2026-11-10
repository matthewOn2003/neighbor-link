import en from "./messages/en.json";
import zh from "./messages/zh.json";
import type { Locale } from "./config";

export * from "./config";
export * from "./routing";

export type T = (key: string, params?: Record<string, string | number>) => string;

const messages: Record<Locale, Record<string, string>> = { en, zh };

export function createT(locale: Locale): T {
  const dict = messages[locale];
  return (key, params) => {
    const message = dict[key] ?? key;
    if (!params) return message;
    return message.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
  };
}
