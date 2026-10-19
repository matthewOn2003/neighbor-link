"use client";

import NextLink from "next/link";
import { usePathname as useRawPathname, useRouter as useRawRouter } from "next/navigation";
import { getLocaleFromPathname, localizeHref, stripLocale } from "@/i18n/routing";

export function usePathname() {
  return stripLocale(useRawPathname());
}

export function useRouter() {
  const router = useRawRouter();
  const locale = getLocaleFromPathname(useRawPathname());
  return {
    ...router,
    push: (href: string, options?: Parameters<typeof router.push>[1]) => router.push(localizeHref(href, locale), options),
    replace: (href: string, options?: Parameters<typeof router.replace>[1]) => router.replace(localizeHref(href, locale), options),
    prefetch: (href: string, options?: Parameters<typeof router.prefetch>[1]) => router.prefetch(localizeHref(href, locale), options),
  };
}

export function Link({ href, ...props }: React.ComponentProps<typeof NextLink>) {
  const locale = getLocaleFromPathname(useRawPathname());
  return <NextLink href={localizeHref(typeof href === "string" ? href : href.pathname ?? "/", locale)} {...props} />;
}
