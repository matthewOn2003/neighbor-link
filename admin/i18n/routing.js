import { defaultLocale, locales } from "./config.js";

const localeCodes = locales.map((item) => item.code);

/** The default locale has no URL prefix; every other locale is prefixed, e.g. /zh/tenants. */
export function getLocaleFromPathname(pathname = "/") {
  const [, firstSegment] = pathname.split("/");
  return firstSegment !== defaultLocale && localeCodes.includes(firstSegment) ? firstSegment : defaultLocale;
}

export function stripLocale(pathname = "/") {
  const locale = getLocaleFromPathname(pathname);
  if (locale === defaultLocale) return pathname;
  return pathname.slice(locale.length + 1) || "/";
}

export function localizePath(path, locale = defaultLocale) {
  if (locale === defaultLocale) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

export function localizeHref(href, locale) {
  return typeof href === "string" && href.startsWith("/") ? localizePath(href, locale) : href;
}
