import { defaultLocale, type Locale } from "@/i18n";

// The portals are separate apps, so their login pages are reached by URL.
// Defaults are the hosted demo portals from the root README.
const DEFAULT_URLS = {
  tenant: "https://neighbor-link-tenant.onrender.com",
  admin: "https://neighbor-link-admin.onrender.com",
} as const;

export type Portal = keyof typeof DEFAULT_URLS;

function baseUrl(portal: Portal): string {
  const configured = portal === "tenant" ? process.env.NEXT_PUBLIC_TENANT_URL : process.env.NEXT_PUBLIC_ADMIN_URL;
  return (configured || DEFAULT_URLS[portal]).replace(/\/+$/, "");
}

/** Login page of a portal. In both apps the login page is the root route ("/", or "/zh"). */
export function portalUrl(portal: Portal, locale: Locale): string {
  const base = baseUrl(portal);
  return locale === defaultLocale ? `${base}/` : `${base}/${locale}`;
}

export const siteLinks = {
  platform: "#platform",
  managers: "#managers",
  tenants: "#tenants",
} as const;
