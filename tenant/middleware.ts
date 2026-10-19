import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, locales } from "./locales.config";

const localeCodes = locales.map((item) => item.code);

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/");
  const hasLocalePrefix = localeCodes.includes(segments[1]);
  const locale = hasLocalePrefix ? segments[1] : defaultLocale;
  const unlocalizedPath = hasLocalePrefix ? `/${segments.slice(2).join("/")}` : pathname;
  const normalizedPath = unlocalizedPath === "" ? "/" : unlocalizedPath;

  if (normalizedPath === "/" || request.cookies.has("auth_token")) {
    if (hasLocalePrefix) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = normalizedPath;
      const response = NextResponse.rewrite(rewriteUrl);
      response.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
      return response;
    }
    const response = NextResponse.next();
    response.cookies.set("NEXT_LOCALE", locale, { path: "/", sameSite: "lax" });
    return response;
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = locale === defaultLocale ? "/" : `/${locale}`;
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
