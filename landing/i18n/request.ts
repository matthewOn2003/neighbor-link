import { headers } from "next/headers";
import { defaultLocale, type Locale } from "./config";

/** Locale set by proxy.ts for the current request. */
export async function getRequestLocale(): Promise<Locale> {
  const value = (await headers()).get("x-locale");
  return value === "zh" ? "zh" : defaultLocale;
}
