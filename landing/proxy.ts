import { NextResponse, type NextRequest } from "next/server";
import { getLocaleFromPathname, stripLocale } from "./i18n/routing";

// Rewrites /zh/... to the single app/ tree and passes the locale on as a request header.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const locale = getLocaleFromPathname(pathname);
  const pagePath = stripLocale(pathname);

  const headers = new Headers(request.headers);
  headers.set("x-locale", locale);

  if (pagePath === pathname) {
    return NextResponse.next({ request: { headers } });
  }

  const url = request.nextUrl.clone();
  url.pathname = pagePath;
  return NextResponse.rewrite(url, { request: { headers } });
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
