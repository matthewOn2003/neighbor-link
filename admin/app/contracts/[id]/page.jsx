"use client";
import { use, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useApiRequest } from "@/hooks/useApiRequest";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { PdfPreviewModal } from "@/components/ui/PdfPreviewModal";
import { buildSimplePdf } from "@/utils/pdf";

const contractRef = (id) => "CT-" + String(id).padStart(5, "0");
const pdfMoney = (value) => "RM " + (Number(value) || 0).toFixed(2);
const pdfContractStatus = { draft: "Draft", active: "Active", expired: "Expired", terminated: "Terminated" };

// Contract summary PDF: English labels and values only (the built-in PDF font is Latin-only).
function buildContractSummaryPdf(contract, tenant) {
  return buildSimplePdf({
    title: "Lease Agreement Summary",
    subtitle: contractRef(contract.id),
    sections: [
      {
        heading: "Parties",
        rows: [
          ["Tenant name", contract.tenant_name],
          ["Tenant phone", tenant?.phone || contract.tenant_phone],
          ["Tenant email", tenant?.email],
        ],
      },
      {
        heading: "Property and unit",
        rows: [
          ["Property", contract.property_name],
          ["Unit", contract.unit_code],
        ],
      },
      {
        heading: "Term",
        rows: [
          ["Start date", contract.start_date],
          ["End date", contract.end_date],
          ["Billing day", contract.billing_day],
          ["Status", pdfContractStatus[contract.status] ?? contract.status],
        ],
      },
      {
        heading: "Financial",
        rows: [
          ["Monthly rent", pdfMoney(contract.monthly_rent)],
          ["Security deposit", pdfMoney(contract.security_deposit)],
        ],
      },
      { heading: "Notes", rows: [["Notes", contract.notes]] },
    ],
    footer: "Generated " + new Date().toISOString().slice(0, 10),
  });
}

async function buildContractPdf(contract) {
  const tenant = await request("/tenant/detail/" + contract.tenant_id).catch(() => null);
  return buildContractSummaryPdf(contract, tenant);
}

const keys = { draft: "contract_status_draft", active: "contract_status_active", expired: "contract_status_expired", terminated: "contract_status_terminated" };
const variants = { draft: "neutral", active: "success", expired: "warning", terminated: "danger" };
const money = (v, locale) => "RM " + Number(v || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ContractDetailPage({ params }) {
  const { id } = use(params), { t, locale } = useLocale(), toast = useToast();
  const { data, loading, error, reload } = useApiRequest("/contract/detail/" + id);
  const [draft, setDraft] = useState(null), [saving, setSaving] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const form = draft || (data ? { tenant_id: String(data.tenant_id), start_date: data.start_date, end_date: data.end_date, monthly_rent: String(data.monthly_rent), security_deposit: String(data.security_deposit), billing_day: String(data.billing_day), status: data.status, notes: data.notes || "" } : null);
  async function save(e) {
    e.preventDefault(); if (!form) return; setSaving(true);
    try {
      await request("/contract/update/" + id, { ...form, tenant_id: Number(form.tenant_id), monthly_rent: Number(form.monthly_rent), security_deposit: Number(form.security_deposit || 0), billing_day: Number(form.billing_day || 1) });
      toast.success(t("contract_saved")); reload();
    } catch (e) { toast.error(e.code === "ACTIVE_CONTRACT_EXISTS" ? t("contract_active_exists") : t("contract_save_failed")); }
    finally { setSaving(false); }
  }
  if (loading) return <main className="p-4 md:p-8"><div className="flex min-h-48 items-center justify-center"><Spinner size="lg" /></div></main>;
  if (error || !data || !form) return <main className="p-4 md:p-8"><section className="panel"><p role="alert" className="text-error">{error || t("contract_not_found")}</p><Link href="/contracts" className="btn btn-outline mt-4">{t("back_to_contracts")}</Link></section></main>;
  const field = "field", label = "field-label", input = "input";
  const fields = [["start_date", "contract_start", "date"], ["end_date", "contract_end", "date"], ["monthly_rent", "monthly_rent", "number"], ["security_deposit", "security_deposit", "number"], ["billing_day", "billing_day", "number"]];
  return <main className="flex w-full flex-col"><div className="p-4 md:p-8"><section className="panel space-y-6">
    <header className="space-y-4">
      <Link href="/contracts" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-dark hover:underline"><span aria-hidden="true">←</span>{t("back_to_contracts")}</Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="space-y-1"><p className="text-xs font-semibold uppercase tracking-wide text-subtle">{t("contract_number")}</p><h1 className="text-3xl font-semibold text-scene-content">CT-{String(data.id).padStart(5, "0")}</h1><p className="text-sm text-subtle">{data.tenant_name} · {data.property_name || "—"} · {data.unit_code || "—"}</p></div><div className="flex flex-wrap items-center gap-2"><span className={"status-pill " + (variants[data.status] || "neutral")}>{t(keys[data.status] || keys.draft)}</span><button type="button" onClick={() => setPdfOpen(true)} className="btn btn-outline"><Icon name="visibility" className="text-lg" /><span>{t("view_pdf")}</span></button></div></div>
    </header>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">{[[t("monthly_rent"), money(data.monthly_rent, locale)], [t("security_deposit"), money(data.security_deposit, locale)], [t("billing_day"), data.billing_day ?? "—"]].map(([k, v]) => <div key={k} className="rounded-xl bg-scene p-4"><p className="text-sm text-subtle">{k}</p><p className="mt-2 text-xl font-semibold text-scene-content">{v}</p></div>)}</div>
    <form onSubmit={save} className="space-y-6"><section className="space-y-4"><div><h2 className="text-lg font-semibold text-scene-content">{t("contract_terms")}</h2><p className="mt-1 text-sm text-subtle">{t("contract_detail_description")}</p></div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{fields.map(([k, tk, type]) => <div key={k} className={field}><label className={label} htmlFor={k}>{t(tk)}</label><input id={k} type={type} min={k === "billing_day" ? 1 : 0} max={k === "billing_day" ? 28 : undefined} step={k === "monthly_rent" || k === "security_deposit" ? "0.01" : undefined} className={input + " w-full"} value={form[k]} onChange={e => setDraft({ ...form, [k]: e.target.value })} required /></div>)}
        <div className={field}><label className={label} htmlFor="status">{t("status")}</label><select id="status" className={input + " w-full"} value={form.status} onChange={e => setDraft({ ...form, status: e.target.value })}>{["draft", "active", "expired", "terminated"].map(s => <option key={s} value={s}>{t(keys[s])}</option>)}</select></div></div>
      <div className={field}><label className={label} htmlFor="notes">{t("notes")}</label><textarea id="notes" rows={4} className={input + " w-full"} value={form.notes} onChange={e => setDraft({ ...form, notes: e.target.value })} /></div>
    </section><div className="flex flex-wrap justify-end gap-3 border-t border-scene pt-5"><Link href="/contracts" className="btn btn-outline">{t("cancel")}</Link><button type="submit" disabled={saving} className="btn btn-primary disabled:opacity-50">{saving ? t("saving") : t("save_changes")}</button></div></form>
  </section></div>
    <PdfPreviewModal open={pdfOpen} onClose={() => setPdfOpen(false)} title={t("lease_agreement_summary")} fileName={"lease-summary-" + contractRef(data.id)} build={() => buildContractPdf(data)} />
  </main>;
}