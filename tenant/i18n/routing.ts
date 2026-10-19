import { defaultLocale, locales } from "@/locales.config";

const localeCodes = locales.map((item) => item.code);

export function getLocaleFromPathname(pathname = "/") {
  const [, firstSegment] = pathname.split("/");
  return firstSegment !== defaultLocale && localeCodes.includes(firstSegment) ? firstSegment : defaultLocale;
}

export function stripLocale(pathname = "/") {
  const locale = getLocaleFromPathname(pathname);
  if (locale === defaultLocale) return pathname;
  return pathname.slice(locale.length + 1) || "/";
}

export function localizePath(path: string, locale = defaultLocale) {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function localizeHref(href: string, locale = defaultLocale) {
  return href.startsWith("/") ? localizePath(href, locale) : href;
}
