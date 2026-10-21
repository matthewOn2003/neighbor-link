import { NextResponse } from "next/server";
import { getLocaleFromPathname, localizePath, stripLocale } from "./i18n/routing.js";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPathname(pathname);
  const pagePath = stripLocale(pathname);

  if (pagePath !== "/" && !request.cookies.has("auth_token")) {
    return NextResponse.redirect(new URL(localizePath("/", locale), request.url));
  }

  if (pagePath === pathname) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = pagePath;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
