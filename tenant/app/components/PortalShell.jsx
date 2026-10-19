"use client";

import { useState } from "react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localizeHref } from "@/i18n/routing";
import { useLocale } from "@/lib/i18n";
import { useApi } from "@/lib/useApi";
import LangSelect from "@/app/components/LangSelect";

const navItems = [
  { href: "/dashboard", key: "dashboard", icon: "▦" },
  { href: "/property", key: "navProperty", icon: "⌂" },
  { href: "/lease", key: "navLease", icon: "▤" },
  { href: "/billing", key: "navBilling", icon: "＄" },
  { href: "/support", key: "navSupport", icon: "♡" },
];

export default function PortalShell({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const api = useApi();
  const { locale, localeProperties } = useLocale();
  const text = localeProperties.messages;
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setLoggingOut(true);
    setError("");
    try {
      await api("/auth/logout", undefined, { method: "POST" });
      router.replace("/");
    } catch {
      setError(text.logoutFailed);
    } finally {
      setLoggingOut(false);
    }
  }

  function navClass(href) {
    const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href + "/"));
    return "flex shrink-0 items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition " +
      (active ? "bg-[#edf4f0] text-[#18322e]" : "text-[#71827c] hover:bg-[#f4f7f5] hover:text-[#18322e]");
  }

  return (
    <div className="min-h-screen bg-[#f4f7f5] text-[#18322e]">
      <header className="sticky top-0 z-20 border-b border-[#dce6e1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href={localizeHref("/dashboard", locale)} className="flex min-w-0 items-center gap-3" aria-label={text.dashboard}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#18322e] text-sm font-bold text-white">NL</span>
            <span className="min-w-0"><span className="block truncate text-sm font-bold tracking-wide">{text.eyebrow}</span><span className="block text-xs text-[#71827c]">{text.tenantPortal}</span></span>
          </a>
          <div className="flex items-center gap-2 sm:gap-4"><LangSelect /><button type="button" onClick={logout} disabled={loggingOut} className="rounded-lg border border-[#dce6e1] px-3 py-2 text-sm font-semibold transition hover:bg-[#f4f7f5] disabled:cursor-wait disabled:opacity-60">{loggingOut ? text.signingOut : text.signOut}</button></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 pt-4 sm:px-6 lg:hidden"><nav aria-label={text.workspace} className="flex gap-1 overflow-x-auto rounded-2xl border border-[#e0e8e4] bg-white p-2 shadow-sm">{navItems.map((item) => <a key={item.href} href={localizeHref(item.href, locale)} aria-current={pathname === item.href ? "page" : undefined} className={navClass(item.href)}><span aria-hidden="true">{item.icon}</span>{text[item.key]}</a>)}</nav></div>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block"><nav aria-label={text.workspace} className="sticky top-24 rounded-2xl border border-[#e0e8e4] bg-white p-3 shadow-sm"><p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider text-[#83918c]">{text.workspace}</p>{navItems.map((item) => <a key={item.href} href={localizeHref(item.href, locale)} aria-current={pathname === item.href ? "page" : undefined} className={navClass(item.href)}><span className="w-5 text-center" aria-hidden="true">{item.icon}</span>{text[item.key]}</a>)}<p className="px-3 pb-1 pt-6 text-xs font-bold uppercase tracking-wider text-[#83918c]">{text.yourHome}</p><p className="px-3 py-2 text-sm leading-6 text-[#71827c]">{text.dashboardNavDescription}</p></nav></aside>
        <main className="min-w-0 space-y-6">{error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}{children}<footer className="border-t border-[#dce6e1] pt-4 text-xs leading-5 text-[#83918c]">{text.dashboardFooter}</footer></main>
      </div>
    </div>
  );
}
