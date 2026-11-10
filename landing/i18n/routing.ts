import { defaultLocale, locales, type Locale } from "./config";

const localeCodes: string[] = locales.map((item) => item.code);

/** The default locale has no URL prefix; every other locale is prefixed, e.g. /zh. */
export function getLocaleFromPathname(pathname = "/"): Locale {
  const [, firstSegment] = pathname.split("/");
  return firstSegment !== defaultLocale && localeCodes.includes(firstSegment) ? (firstSegment as Locale) : defaultLocale;
}

export function stripLocale(pathname = "/"): string {
  const locale = getLocaleFromPathname(pathname);
  if (locale === defaultLocale) return pathname;
  return pathname.slice(locale.length + 1) || "/";
}

export function localizePath(path: string, locale: Locale): string {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}
