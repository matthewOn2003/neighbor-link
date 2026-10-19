"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { useLocale } from "@/lib/i18n";
import LangSelect from "@/app/components/LangSelect";

const modules = [
  { key: "rental", icon: "⌂", titleKey: "moduleRental", descriptionKey: "moduleRentalDescription" },
  { key: "contract", icon: "▤", titleKey: "moduleContract", descriptionKey: "moduleContractDescription" },
  { key: "billing", icon: "＄", titleKey: "moduleBilling", descriptionKey: "moduleBillingDescription" },
  { key: "support", icon: "♡", titleKey: "moduleSupport", descriptionKey: "moduleSupportDescription" },
];

export default function DashboardPage() {
  const router = useRouter();
  const api = useApi();
  const { localeProperties } = useLocale();
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

  return (
    <main className="min-h-screen bg-[#f4f7f5] text-[#18322e]">
      <header className="sticky top-0 z-20 border-b border-[#dce6e1] bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <a href="/dashboard" className="flex min-w-0 items-center gap-3" aria-label={text.dashboard}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#18322e] text-sm font-bold text-white">NL</span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-bold tracking-wide">NEIGHBOR LINK</span>
              <span className="block text-xs text-[#71827c]">{text.tenantPortal}</span>
            </span>
          </a>
          <div className="flex items-center gap-2 sm:gap-4">
            <LangSelect />
            <button type="button" onClick={logout} disabled={loggingOut} className="rounded-lg border border-[#dce6e1] px-3 py-2 text-sm font-semibold transition hover:bg-[#f4f7f5] disabled:cursor-wait disabled:opacity-60">
              {loggingOut ? text.signingOut : text.signOut}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 sm:py-8 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-[#e0e8e4] bg-white p-3 shadow-sm">
            <p className="px-3 pb-3 pt-2 text-xs font-bold uppercase tracking-wider text-[#83918c]">{text.workspace}</p>
            <div className="flex items-center gap-3 rounded-xl bg-[#edf4f0] px-3 py-3 text-sm font-semibold text-[#18322e]">
              <span aria-hidden="true">▦</span>{text.dashboard}
            </div>
            <p className="px-3 pb-1 pt-6 text-xs font-bold uppercase tracking-wider text-[#83918c]">{text.yourHome}</p>
            <p className="px-3 py-2 text-sm leading-6 text-[#71827c]">{text.dashboardNavDescription}</p>
          </div>
        </aside>

        <section className="min-w-0 space-y-6">
          <div className="rounded-2xl bg-[#18322e] p-6 text-white shadow-sm sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9d2c7]">{text.overview}</p>
            <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{text.welcomeTitle}</h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d4e1db]">{text.welcomeDescription}</p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-[#e2eee8]">
                <span className="h-2 w-2 rounded-full bg-[#a6d5b8]" />{text.accountPortal}
              </span>
            </div>
          </div>

          {error ? <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-semibold">{text.homeOverview}</h2>
            <p className="text-sm text-[#71827c]">{text.homeOverviewDescription}</p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {modules.map((module) => (
              <article key={module.key} className="flex min-h-48 flex-col rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf4f0] text-xl text-[#315b4c]" aria-hidden="true">{module.icon}</span>
                  <span className="rounded-full bg-[#f3f5f4] px-2.5 py-1 text-xs font-semibold text-[#71827c]">{text.comingSoon}</span>
                </div>
                <h3 className="mt-4 text-base font-semibold">{text[module.titleKey]}</h3>
                <p className="mt-2 text-sm leading-6 text-[#71827c]">{text[module.descriptionKey]}</p>
              </article>
            ))}
          </div>

          <footer className="border-t border-[#dce6e1] pt-4 text-xs leading-5 text-[#83918c]">{text.dashboardFooter}</footer>
        </section>
      </div>
    </main>
  );
}
