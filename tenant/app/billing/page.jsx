"use client";

import { useState } from "react";
import PortalShell from "@/app/components/PortalShell";
import { useLocale } from "@/lib/i18n";

const initialBills = [
  { id: "BL-2026-003", period: "Oct 2026", due: "01 Oct 2026", amount: 1800, status: "unpaid" },
  { id: "BL-2026-002", period: "Sep 2026", due: "01 Sep 2026", amount: 1800, status: "paid" },
  { id: "BL-2026-001", period: "Aug 2026", due: "01 Aug 2026", amount: 1800, status: "paid" },
];

export default function BillingPage() {
  const { locale, localeProperties } = useLocale();
  const t = localeProperties.messages;
  const [bills, setBills] = useState(initialBills);
  const [showNotice, setShowNotice] = useState(false);
  const unpaid = bills.filter((bill) => bill.status === "unpaid").reduce((sum, bill) => sum + bill.amount, 0);
  const money = (amount) => new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-MY", { style: "currency", currency: "MYR" }).format(amount);
  function simulatePayment(id) { setBills((current) => current.map((bill) => bill.id === id ? { ...bill, status: "paid" } : bill)); setShowNotice(true); }
  return (
    <PortalShell>
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d86d43]">NEIGHBOR LINK</p><h1 className="mt-2 text-3xl font-semibold">{t.billingTitle}</h1><p className="mt-2 text-sm text-[#71827c]">{t.billingSubtitle}</p></div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"><strong>{t.prototypeDataTitle} </strong>{t.billingDemoNotice}</p>
      {showNotice ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{t.simulatedPaymentNotice}</p> : null}
      <section className="grid gap-4 sm:grid-cols-3"><Summary label={t.outstandingBalance} value={money(unpaid)} tone="orange" /><Summary label={t.totalBills} value={String(bills.length)} /><Summary label={t.paidBills} value={String(bills.filter((bill) => bill.status === "paid").length)} tone="green" /></section>
      <section className="overflow-hidden rounded-2xl border border-[#e0e8e4] bg-white shadow-sm"><div className="flex items-center justify-between gap-3 border-b border-[#edf1ee] p-5"><div><h2 className="font-semibold">{t.billingHistory}</h2><p className="mt-1 text-sm text-[#71827c]">{t.lastThreePeriods}</p></div><span className="rounded-full bg-[#f4f7f5] px-3 py-1 text-xs font-semibold text-[#52645d]">{t.threeRecords}</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#f7f9f8] text-xs uppercase tracking-wide text-[#71827c]"><tr>{[t.billReference, t.billingPeriod, t.dueDate, t.amount, t.status, t.action].map((label) => <th key={label} className="px-5 py-4 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1ee]">{bills.map((bill) => <tr key={bill.id} className="hover:bg-[#fafcfb]"><td className="whitespace-nowrap px-5 py-4 font-semibold">{bill.id}</td><td className="px-5 py-4">{bill.period}</td><td className="whitespace-nowrap px-5 py-4">{bill.due}</td><td className="whitespace-nowrap px-5 py-4 font-semibold">{money(bill.amount)}</td><td className="px-5 py-4"><span className={bill.status === "paid" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800"}>{bill.status === "paid" ? t.paid : t.unpaid}</span></td><td className="px-5 py-4">{bill.status === "unpaid" ? <button type="button" onClick={() => simulatePayment(bill.id)} className="rounded-lg bg-[#18322e] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#315b4c]">{t.simulatePayment}</button> : <span className="text-xs text-[#83918c]">{t.complete}</span>}</td></tr>)}</tbody></table></div>
      </section>
    </PortalShell>
  );
}

function Summary({ label, value, tone = "default" }) { const styles = tone === "orange" ? "bg-orange-50 text-orange-900" : tone === "green" ? "bg-emerald-50 text-emerald-900" : "bg-white text-[#18322e] border border-[#e0e8e4]"; return <div className={`rounded-2xl p-5 shadow-sm ${styles}`}><p className="text-sm opacity-75">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></div>; }
