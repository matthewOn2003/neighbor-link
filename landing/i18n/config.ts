export const defaultLocale = "en";

export const locales = [
  { code: "zh", name: "中文", name_short: "中文", file: "zh.json", htmlLang: "zh-Hans" },
  { code: "en", name: "English", name_short: "EN", file: "en.json", htmlLang: "en" },
] as const;

export type Locale = (typeof locales)[number]["code"];
