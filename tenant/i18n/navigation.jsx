"use client";

import NextLink from "next/link";
import { usePathname as useRawPathname, useRouter as useRawRouter } from "next/navigation";
import { getLocaleFromPathname, localizeHref, stripLocale } from "./routing.js";

/** Pathname without the locale prefix, e.g. /zh/tenants -> /tenants. */
export function usePathname() {
  return stripLocale(useRawPathname());
}

export function useRouter() {
  const router = useRawRouter();
  const locale = getLocaleFromPathname(useRawPathname());
  return {
    ...router,
    push: (href, options) => router.push(localizeHref(href, locale), options),
    replace: (href, options) => router.replace(localizeHref(href, locale), options),
    prefetch: (href, options) => router.prefetch(localizeHref(href, locale), options),
  };
}

export function Link({ href, ...props }) {
  const locale = getLocaleFromPathname(useRawPathname());
  return <NextLink href={localizeHref(href, locale)} {...props} />;
}
