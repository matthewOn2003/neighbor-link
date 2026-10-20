"use client";
import { use, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRequest } from "@/hooks/useRequest";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { useToast } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";

const money = (v, locale) => "RM " + Number(v || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const keys = { unpaid: "bill_status_unpaid", partial: "bill_status_partial", paid: "bill_status_paid", overdue: "bill_status_overdue", void: "bill_status_void" };
const variants = { unpaid: "neutral", partial: "warning", paid: "success", overdue: "danger", void: "neutral" };

export default function BillDetailPage({ params }) {
  const { id } = use(params), { t, locale } = useLocale(), toast = useToast();
  const { data, loading, error, reload } = useRequest("/bill/detail/" + id);
  const [amount, setAmount] = useState(""), [method, setMethod] = useState("bank_transfer"), [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10)), [saving, setSaving] = useState(false);
  if (loading) return <main className="p-4 md:p-8"><div className="flex min-h-48 items-center justify-center"><Spinner size="lg" /></div></main>;
  if (error || !data) return <main className="p-4 md:p-8"><section className="panel"><p role="alert" className="text-error">{error || t("bill_not_found")}</p><Link href="/bills" className="btn btn-outline mt-4">{t("back_to_bills")}</Link></section></main>;
  const total = Number(data.amount) + Number(data.late_fee), outstanding = Math.max(0, total - Number(data.amount_paid));
  async function pay(e) {
    e.preventDefault(); setSaving(true);
    try { await request("/bill/payment/" + id, { amount: Number(amount), method, reference: reference.trim(), paid_at: paidAt }); toast.success(t("payment_recorded")); setAmount(""); setReference(""); reload(); }
    catch (e) { toast.error(e.code === "INVALID_PAYMENT" ? t("invalid_payment") : t("payment_failed")); }
    finally { setSaving(false); }
  }
  async function voidBill() {
    if (!window.confirm(t("confirm_void_bill"))) return; setSaving(true);
    try { await request("/bill/void/" + id, {}); toast.success(t("bill_voided")); reload(); }
    catch { toast.error(t("bill_cannot_void")); }
    finally { setSaving(false); }
  }
  const field = "field", label = "field-label", input = "input";
  const details = [[t("tenant"), data.tenant_name], [t("billing_period"), data.billing_period], [t("due_date"), data.due_date], [t("monthly_rent"), money(data.amount, locale)], [t("late_fee"), money(data.late_fee, locale)], [t("payment_method"), data.payment_method || "—"], [t("payment_reference"), data.payment_reference || "—"], [t("paid_at"), data.paid_at || "—"], [t("notes"), data.notes || "—"]];
  return <main className="flex w-full flex-col"><div className="p-4 md:p-8"><section className="panel space-y-6">
    <header className="space-y-4"><Link href="/bills" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-dark hover:underline"><span aria-hidden="true">←</span>{t("back_to_bills")}</Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-subtle">{t("bill_number")}</p><h1 className="text-3xl font-semibold text-scene-content">BL-{String(data.id).padStart(5, "0")}</h1><p className="text-sm text-subtle">{data.tenant_name} · {data.property_name || "—"} · {data.unit_code || "—"}</p></div><span className={"status-pill " + (variants[data.status] || "neutral")}>{t(keys[data.status] || keys.unpaid)}</span></div>
    </header>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[[t("bill_amount"), money(total, locale)], [t("bill_paid"), money(data.amount_paid, locale)], [t("bill_outstanding"), money(outstanding, locale)]].map(([k, v]) => <div key={k} className="rounded-xl bg-scene p-4"><p className="text-sm text-subtle">{k}</p><p className="mt-2 text-xl font-semibold text-scene-content">{v}</p></div>)}</div>
    <section className="space-y-4"><div><h2 className="text-lg font-semibold text-scene-content">{t("bill_details")}</h2><p className="mt-1 text-sm text-subtle">{t("bill_detail_description")}</p></div><dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">{details.map(([k, v]) => <div key={k} className="rounded-lg bg-scene p-3"><dt className="text-sm text-subtle">{k}</dt><dd className="mt-1 break-words font-semibold text-scene-content">{v}</dd></div>)}</dl></section>
    {data.status !== "paid" && data.status !== "void" ? <form onSubmit={pay} className="space-y-4 border-t border-scene pt-6"><div><h2 className="text-lg font-semibold text-scene-content">{t("record_payment")}</h2><p className="mt-1 text-sm text-subtle">{t("payment_remaining")}: <strong className="text-scene-content">{money(outstanding, locale)}</strong></p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2"><div className={field}><label htmlFor="amount" className={label}>{t("payment_amount")} *</label><input id="amount" type="number" min="0.01" max={outstanding} step="0.01" value={amount} onChange={e => setAmount(e.target.value)} className={input + " w-full"} required /></div>
        <div className={field}><label htmlFor="method" className={label}>{t("payment_method")} *</label><select id="method" value={method} onChange={e => setMethod(e.target.value)} className={input + " w-full"}><option value="bank_transfer">{t("payment_bank_transfer")}</option><option value="cash">{t("payment_cash")}</option><option value="online">{t("payment_online")}</option><option value="other">{t("payment_other")}</option></select></div>
        <div className={field}><label htmlFor="paidAt" className={label}>{t("paid_at")} *</label><input id="paidAt" type="date" value={paidAt} onChange={e => setPaidAt(e.target.value)} className={input + " w-full"} required /></div>
        <div className={field}><label htmlFor="reference" className={label}>{t("payment_reference")}</label><input id="reference" value={reference} onChange={e => setReference(e.target.value)} className={input + " w-full"} /></div></div>
      <div className="flex flex-wrap justify-end gap-3 border-t border-scene pt-5"><button type="button" disabled={saving || Number(data.amount_paid) > 0} onClick={voidBill} className="btn btn-outline disabled:opacity-40">{t("void_bill")}</button><button type="submit" disabled={saving || outstanding <= 0} className="btn btn-primary disabled:opacity-40">{saving ? t("saving") : t("record_payment")}</button></div>
    </form> : null}
    {data.status === "void" ? <p className="rounded-xl bg-scene p-4 text-sm text-subtle">{t("bill_voided_notice")}</p> : null}
  </section></div></main>;
}