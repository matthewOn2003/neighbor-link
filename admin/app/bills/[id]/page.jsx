"use client";
import { use, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRequest } from "@/hooks/useRequest";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { useToast } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { PdfPreviewModal } from "@/components/ui/PdfPreviewModal";
import { buildSimplePdf } from "@/utils/pdf";

const money = (v, locale) => "RM " + Number(v || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const keys = { unpaid: "bill_status_unpaid", partial: "bill_status_partial", paid: "bill_status_paid", overdue: "bill_status_overdue", void: "bill_status_void", pending_review: "bill_status_pending_review" };
const variants = { unpaid: "neutral", partial: "warning", paid: "success", overdue: "danger", void: "neutral", pending_review: "warning" };

const billRef = (id) => "BL-" + String(id).padStart(5, "0");
const pdfMoney = (value) => "RM " + (Number(value) || 0).toFixed(2);
const pdfStatus = { unpaid: "Unpaid", overdue: "Overdue", paid: "Paid", void: "Void", pending_review: "Pending review" };

// Invoice PDF: English labels and values only (the built-in PDF font is Latin-only).
function buildInvoicePdf(bill) {
  const total = Number(bill.amount) + Number(bill.late_fee);
  return buildSimplePdf({
    title: "Invoice",
    subtitle: billRef(bill.id),
    sections: [
      {
        heading: "Bill",
        rows: [
          ["Invoice reference", billRef(bill.id)],
          ["Tenant", bill.tenant_name],
          ["Unit", bill.unit_code],
          ["Property", bill.property_name],
          ["Billing period", bill.billing_period],
          ["Due date", bill.due_date],
          ["Status", pdfStatus[bill.display_status ?? bill.status] ?? bill.status],
        ],
      },
      {
        heading: "Amount",
        rows: [
          ["Amount", pdfMoney(bill.amount)],
          ["Late fee", pdfMoney(bill.late_fee)],
          ["Total", pdfMoney(total)],
        ],
      },
    ],
    footer: "Generated " + new Date().toISOString().slice(0, 10),
  });
}

export default function BillDetailPage({ params }) {
  const { id } = use(params), { t, locale } = useLocale(), toast = useToast();
  const { data, loading, error, reload } = useRequest("/bill/detail/" + id);
  const [amount, setAmount] = useState(""), [method, setMethod] = useState("bank_transfer"), [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10)), [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false), [editSaving, setEditSaving] = useState(false);
  const [edit, setEdit] = useState({ amount: "", late_fee: "", due_date: "", notes: "" });
  const [pdfOpen, setPdfOpen] = useState(false);
  if (loading) return <main className="p-4 md:p-8"><div className="flex min-h-48 items-center justify-center"><Spinner size="lg" /></div></main>;
  if (error || !data) return <main className="p-4 md:p-8"><section className="panel"><p role="alert" className="text-error">{error || t("bill_not_found")}</p><Link href="/bills" className="btn btn-outline mt-4">{t("back_to_bills")}</Link></section></main>;
  const total = Number(data.amount) + Number(data.late_fee), outstanding = Math.max(0, total - Number(data.amount_paid));
  const displayStatus = data.display_status || data.status;
  const editable = data.status === "unpaid";
  const editLocked = data.status === "overdue";
  function openEdit() {
    setEdit({ amount: String(data.amount), late_fee: String(data.late_fee), due_date: data.due_date, notes: data.notes || "" });
    setEditOpen(true);
  }
  async function saveEdit(e) {
    e.preventDefault(); setEditSaving(true);
    try {
      await request("/bill/update/" + id, { amount: Number(edit.amount), late_fee: Number(edit.late_fee || 0), due_date: edit.due_date, notes: edit.notes.trim() });
      toast.success(t("bill_updated")); setEditOpen(false); reload();
    } catch (err) {
      toast.error(err?.code === "INVALID_STATE" ? t("bill_not_editable") : err?.code === "INVALID_BILL" ? t("invalid_bill") : t("bill_update_failed"));
    } finally { setEditSaving(false); }
  }
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-subtle">{t("bill_number")}</p><h1 className="text-3xl font-semibold text-scene-content">{billRef(data.id)}</h1><p className="text-sm text-subtle">{data.tenant_name} · {data.property_name || "—"} · {data.unit_code || "—"}</p></div>
        <div className="flex flex-wrap items-center gap-2"><span className={"status-pill " + (variants[displayStatus] || "neutral")}>{t(keys[displayStatus] || keys.unpaid)}</span>
          <button type="button" onClick={() => setPdfOpen(true)} className="btn btn-outline"><Icon name="visibility" className="text-lg" /><span>{t("view_pdf")}</span></button>
          {editable ? <button type="button" onClick={openEdit} className="btn btn-outline"><Icon name="edit" className="text-lg" /><span>{t("edit_bill")}</span></button> : null}
          {editLocked ? <button type="button" disabled aria-describedby="bill-edit-locked" className="btn btn-outline disabled:opacity-40"><Icon name="edit" className="text-lg" /><span>{t("edit_bill")}</span></button> : null}
        </div></div>
      {editLocked ? <p id="bill-edit-locked" className="text-sm text-subtle">{t("bill_edit_locked_overdue")}</p> : null}
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
  </section></div>
  <Modal open={editOpen} title={t("edit_bill")} onClose={() => setEditOpen(false)} size="md" footer={<>
    <button type="button" className="btn btn-outline" onClick={() => setEditOpen(false)} disabled={editSaving}>{t("cancel")}</button>
    <button type="submit" form="bill-edit-form" className="btn btn-primary" disabled={editSaving}>{editSaving ? t("saving") : t("save_changes")}</button>
  </>}>
    <form id="bill-edit-form" onSubmit={saveEdit} className="grid gap-4">
      <div className={field}><label htmlFor="edit-amount" className={label}>{t("bill_amount")} *</label><input id="edit-amount" type="number" min="0" step="0.01" value={edit.amount} onChange={e => setEdit({ ...edit, amount: e.target.value })} className={input + " w-full"} required /></div>
      <div className={field}><label htmlFor="edit-late-fee" className={label}>{t("late_fee")}</label><input id="edit-late-fee" type="number" min="0" step="0.01" value={edit.late_fee} onChange={e => setEdit({ ...edit, late_fee: e.target.value })} className={input + " w-full"} /></div>
      <div className={field}><label htmlFor="edit-due-date" className={label}>{t("due_date")} *</label><input id="edit-due-date" type="date" value={edit.due_date} onChange={e => setEdit({ ...edit, due_date: e.target.value })} className={input + " w-full"} required /></div>
      <div className={field}><label htmlFor="edit-notes" className={label}>{t("notes")}</label><textarea id="edit-notes" rows={3} value={edit.notes} onChange={e => setEdit({ ...edit, notes: e.target.value })} className={input + " w-full"} /></div>
    </form>
  </Modal>
  <PdfPreviewModal open={pdfOpen} onClose={() => setPdfOpen(false)} title={t("invoice")} fileName={"invoice-" + billRef(data.id)} build={() => buildInvoicePdf(data)} />
  </main>;
}
