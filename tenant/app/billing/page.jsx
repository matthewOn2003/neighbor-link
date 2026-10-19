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
  const { localeProperties } = useLocale();
  const zh = localeProperties.code === "zh";
  const [bills, setBills] = useState(initialBills);
  const [showNotice, setShowNotice] = useState(false);
  const unpaid = bills.filter((bill) => bill.status === "unpaid").reduce((sum, bill) => sum + bill.amount, 0);
  const money = (amount) => "RM " + amount.toLocaleString(zh ? "zh-CN" : "en-MY", { minimumFractionDigits: 2 });
  function simulatePayment(id) {
    setBills((current) => current.map((bill) => bill.id === id ? { ...bill, status: "paid" } : bill));
    setShowNotice(true);
  }
  return (
    <PortalShell>
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d86d43]">NEIGHBOR LINK</p><h1 className="mt-2 text-3xl font-semibold">{zh ? "账单与付款" : "Bills & payments"}</h1><p className="mt-2 text-sm text-[#71827c]">{zh ? "查看示例账单及付款状态。" : "Review sample charges and payment status."}</p></div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"><strong>{zh ? "测试数据：" : "Prototype data: "}</strong>{zh ? "所有金额均为示例。付款按钮只会改变当前页面状态，不会收款或保存记录。" : "Amounts are illustrative. Payment actions only update this page's local state; no money is collected and nothing is saved."}</p>
      {showNotice ? <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{zh ? "已在演示中标记为已付款；此操作未产生真实交易。" : "Marked as paid in this demo only. No real transaction was made."}</p> : null}
      <section className="grid gap-4 sm:grid-cols-3">
        <Summary label={zh ? "未付余额" : "Outstanding balance"} value={money(unpaid)} tone="orange" />
        <Summary label={zh ? "账单数量" : "Total bills"} value={String(bills.length)} />
        <Summary label={zh ? "已付款" : "Paid bills"} value={String(bills.filter((bill) => bill.status === "paid").length)} tone="green" />
      </section>
      <section className="overflow-hidden rounded-2xl border border-[#e0e8e4] bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf1ee] p-5"><div><h2 className="font-semibold">{zh ? "账单记录" : "Billing history"}</h2><p className="mt-1 text-sm text-[#71827c]">{zh ? "最近三期租金示例" : "Sample rent charges for the last three periods"}</p></div><span className="rounded-full bg-[#f4f7f5] px-3 py-1 text-xs font-semibold text-[#52645d]">{zh ? "3 条记录" : "3 records"}</span></div>
        <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-[#f7f9f8] text-xs uppercase tracking-wide text-[#71827c]"><tr>{[zh ? "账单编号" : "Bill reference", zh ? "账期" : "Billing period", zh ? "到期日" : "Due date", zh ? "金额" : "Amount", zh ? "状态" : "Status", zh ? "操作" : "Action"].map((label) => <th key={label} className="px-5 py-4 font-semibold">{label}</th>)}</tr></thead><tbody className="divide-y divide-[#edf1ee]">{bills.map((bill) => <tr key={bill.id} className="hover:bg-[#fafcfb]"><td className="whitespace-nowrap px-5 py-4 font-semibold">{bill.id}</td><td className="px-5 py-4">{bill.period}</td><td className="whitespace-nowrap px-5 py-4">{bill.due}</td><td className="whitespace-nowrap px-5 py-4 font-semibold">{money(bill.amount)}</td><td className="px-5 py-4"><span className={bill.status === "paid" ? "rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800" : "rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800"}>{bill.status === "paid" ? (zh ? "已付款" : "Paid") : (zh ? "待付款" : "Unpaid")}</span></td><td className="px-5 py-4">{bill.status === "unpaid" ? <button type="button" onClick={() => simulatePayment(bill.id)} className="rounded-lg bg-[#18322e] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#315b4c]">{zh ? "模拟付款" : "Simulate payment"}</button> : <span className="text-xs text-[#83918c]">{zh ? "已完成" : "Complete"}</span>}</td></tr>)}</tbody></table></div>
      </section>
    </PortalShell>
  );
}

function Summary({ label, value, tone = "default" }) {
  const styles = tone === "orange" ? "bg-orange-50 text-orange-900" : tone === "green" ? "bg-emerald-50 text-emerald-900" : "bg-white text-[#18322e] border border-[#e0e8e4]";
  return <div className={`rounded-2xl p-5 shadow-sm ${styles}`}><p className="text-sm opacity-75">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p></div>;
}
