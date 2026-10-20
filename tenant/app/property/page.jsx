"use client";

import PortalShell from "@/app/components/PortalShell";
import { useLocale } from "@/lib/i18n";

export default function PropertyPage() {
  const { localeProperties } = useLocale();
  const t = localeProperties.messages;

  const details = [
    [t.propertyLabel, "Maple Residences"],
    [t.unitLabel, "B-12-08"],
    [t.unitType, t.twoBedroomApartment],
    [t.moveInDate, "01 Mar 2026"],
    [t.tenancyStatus, t.activeTenancy],
  ];

  const tips = [
    [t.visitorAccess, t.visitorAccessDescription],
    [t.sharedFacilities, t.sharedFacilitiesDescription],
    [t.repairs, t.repairsDescription],
  ];

  return (
    <PortalShell>
      <PageHeading title={t.myHomeTitle} subtitle={t.myHomeSubtitle} />
      <DemoNotice text={t.propertyDemoNotice} title={t.prototypeDataTitle} />

      <section className="overflow-hidden rounded-2xl border border-[#e0e8e4] bg-white shadow-sm">
        <div className="relative min-h-48 overflow-hidden bg-[#dce9e1] p-6 sm:p-8">
          <div className="absolute -right-8 -top-16 h-64 w-64 rounded-full bg-white/40" />
          <div className="absolute bottom-0 right-16 h-36 w-24 rounded-t-2xl bg-[#9bb8a7]" />
          <div className="absolute bottom-0 right-44 h-28 w-20 rounded-t-2xl bg-[#b5cbbd]" />

          <div className="relative max-w-lg">
            <span className="inline-flex rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-[#315b4c]">
              {t.currentHome}
            </span>
            <h2 className="mt-4 text-2xl font-semibold">Maple Residences</h2>
            <p className="mt-2 text-sm text-[#526e61]">12 Maple Avenue, Johor Bahru</p>
          </div>
        </div>

        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label} className="border-t border-[#edf1ee] p-5">
              <p className="text-xs font-semibold text-[#83918c]">{label}</p>
              <p className="mt-2 font-semibold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-semibold">{t.residentEssentials}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {tips.map(([title, body]) => (
            <div key={title} className="rounded-xl bg-[#f4f7f5] p-4">
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-[#71827c]">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </PortalShell>
  );
}

function PageHeading({ title, subtitle }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d86d43]">
        NEIGHBOR LINK
      </p>
      <h1 className="mt-2 text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-sm text-[#71827c]">{subtitle}</p>
    </div>
  );
}

function DemoNotice({ title, text }) {
  return (
    <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
      <strong>{title} </strong>
      {text}
    </p>
  );
}