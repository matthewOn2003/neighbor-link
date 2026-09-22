export type LocaleConfig = {
  code: string;
  name: string;
  name_short: string;
  file: string;
};

export const locales: LocaleConfig[] = [
  {
    code: "zh",
    name: "中文",
    name_short: "中文",
    file: "zh.json",
  },
  {
    code: "en",
    name: "English",
    name_short: "EN",
    file: "en.json",
  },
];
