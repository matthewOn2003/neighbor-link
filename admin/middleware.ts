import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === "/" || request.cookies.has("auth_token")) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
