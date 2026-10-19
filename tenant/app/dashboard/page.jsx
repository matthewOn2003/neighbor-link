"use client";

import { useLocale } from "@/lib/i18n";
import PortalShell from "@/app/components/PortalShell";
import FeatureCard from "@/app/components/FeatureCard";

const modules = [
  { key: "rental", icon: "⌂", titleKey: "moduleRental", descriptionKey: "moduleRentalDescription" },
  { key: "contract", icon: "▤", titleKey: "moduleContract", descriptionKey: "moduleContractDescription" },
  { key: "billing", icon: "＄", titleKey: "moduleBilling", descriptionKey: "moduleBillingDescription" },
  { key: "support", icon: "♡", titleKey: "moduleSupport", descriptionKey: "moduleSupportDescription" },
];

export default function DashboardPage() {
  const { localeProperties } = useLocale();
  const text = localeProperties.messages;

  return (
    <PortalShell>
      <section className="rounded-2xl bg-[#18322e] p-6 text-white shadow-sm sm:p-8">
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
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">{text.homeOverview}</h2>
          <p className="mt-1 text-sm text-[#71827c]">{text.homeOverviewDescription}</p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {modules.map((module) => (
            <FeatureCard
              key={module.key}
              icon={module.icon}
              title={text[module.titleKey]}
              description={text[module.descriptionKey]}
              status={text.comingSoon}
            />
          ))}
        </div>
      </section>
    </PortalShell>
  );
}
