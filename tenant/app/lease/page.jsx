"use client";

import PortalShell from "@/app/components/PortalShell";
import { useLocale } from "@/lib/i18n";

export default function LeasePage() {
  const { localeProperties } = useLocale();
  const t = localeProperties.messages;
  const terms = [
    [t.leaseStarts, "01 Mar 2026"], [t.leaseEnds, "28 Feb 2027"], [t.monthlyRent, "RM 1,800.00"],
    [t.securityDeposit, "RM 3,600.00"], [t.rentDue, t.firstDayOfEachMonth], [t.agreementStatus, t.activeTenancy],
  ];
  return (
    <PortalShell>
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d86d43]">NEIGHBOR LINK</p><h1 className="mt-2 text-3xl font-semibold">{t.leaseAgreementTitle}</h1><p className="mt-2 text-sm text-[#71827c]">{t.leaseAgreementSubtitle}</p></div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"><strong>{t.prototypeDataTitle} </strong>{t.leaseDemoNotice}</p>
      <section className="rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm sm:p-7"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{t.activeTenancy}</span><h2 className="mt-4 text-xl font-semibold">Maple Residences · B-12-08</h2><p className="mt-1 text-sm text-[#71827c]">{t.agreementReference}: NL-LEASE-2026-001</p></div><div className="rounded-xl bg-[#f4f7f5] p-4 sm:min-w-48"><p className="text-xs text-[#71827c]">{t.monthlyRent}</p><p className="mt-1 text-2xl font-semibold">RM 1,800.00</p><p className="mt-1 text-xs text-[#71827c]">{t.dueOnFirst}</p></div></div><div className="mt-6 grid gap-0 border-t border-[#edf1ee] sm:grid-cols-2 lg:grid-cols-3">{terms.map(([label, value]) => <div key={label} className="border-b border-[#edf1ee] py-4 sm:px-3"><p className="text-xs text-[#83918c]">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>)}</div></section>
      <section className="rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-semibold">{t.importantReminders}</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-[#52645d]"><li className="flex gap-3"><span className="text-[#d86d43]">•</span>{t.renewalReminder}</li><li className="flex gap-3"><span className="text-[#d86d43]">•</span>{t.paymentRecordReminder}</li><li className="flex gap-3"><span className="text-[#d86d43]">•</span>{t.signedLeaseNotConnected}</li></ul></section>
    </PortalShell>
  );
}
