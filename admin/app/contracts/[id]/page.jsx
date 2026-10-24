"use client";

import { use, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useApiRequest } from "@/hooks/useApiRequest";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { Spinner, Input, Textarea, useToast, Icon, PdfPreviewModal, Select, StatusBadge } from "@/components/ui";
import { buildContractSummaryPdf, contractRef } from "@/utils/documents";
import { formatMoney } from "@/utils/format";
import { useDropdown } from "@/hooks/useDropdown";
import { apiErrorMessage } from "@/utils/errors";
import { api } from "@/services/api";

async function buildContractPdf(contract) {
  const tenant = await request(api.tenant.detail(contract.tenant_id)).catch(() => null);
  return buildContractSummaryPdf(contract, tenant);
}


export default function ContractDetailPage({ params }) {
  const { id } = use(params);
  const { t, locale } = useLocale();
  const toast = useToast();
  const { optionsOf } = useDropdown(["contract_status"]);
  const contractStatusItems = optionsOf("contract_status");

  const { data, loading, error, reload } = useApiRequest(api.contract.detail(id));

  const [draft, setDraft] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);

  const form =
    draft ||
    (data
      ? {
        tenant_id: String(data.tenant_id),
        start_date: data.start_date,
        end_date: data.end_date,
        monthly_rent: String(data.monthly_rent),
        security_deposit: String(data.security_deposit),
        billing_day: String(data.billing_day),
        status: data.status,
        notes: data.notes || "",
      }
      : null);

  async function save(e) {
    e.preventDefault();
    if (!form) return;

    setSubmitting(true);
    try {
      await request(api.contract.update(id), {
        ...form,
        tenant_id: Number(form.tenant_id),
        monthly_rent: Number(form.monthly_rent),
        security_deposit: Number(form.security_deposit || 0),
        billing_day: Number(form.billing_day || 1),
      });
      toast.success(t("contract_saved"));
      reload();
    } catch (e) {
      toast.error(
        apiErrorMessage(e, t, {
          fallbackKey: "contract_save_failed",
          codes: { ACTIVE_CONTRACT_EXISTS: "contract_active_exists" },
          serverMessage: false,
        })
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <main className="p-4 md:p-8">
        <div className="flex min-h-48 items-center justify-center">
          <Spinner size="lg" />
        </div>
      </main>
    );
  }

  if (error || !data || !form) {
    return (
      <main className="p-4 md:p-8">
        <section className="panel">
          <p role="alert" className="text-error">
            {error || t("contract_not_found")}
          </p>
          <Link href="/contracts" className="btn btn-outline mt-4">
            {t("back_to_contracts")}
          </Link>
        </section>
      </main>
    );
  }

  const field = "field";
  const label = "field-label";

  const fields = [
    ["start_date", "contract_start", "date"],
    ["end_date", "contract_end", "date"],
    ["monthly_rent", "monthly_rent", "number"],
    ["security_deposit", "security_deposit", "number"],
    ["billing_day", "billing_day", "number"],
  ];

  const summaryCards = [
    [t("monthly_rent"), formatMoney(data.monthly_rent, locale)],
    [t("security_deposit"), formatMoney(data.security_deposit, locale)],
    [t("billing_day"), data.billing_day ?? "—"],
  ];

  return (
    <main className="flex w-full flex-col">
      <div className="p-4 md:p-8">
        <section className="panel space-y-6">
          <header className="space-y-4">
            <Link
              href="/contracts"
              className="link-action"
            >
              <span aria-hidden="true">←</span>
              {t("back_to_contracts")}
            </Link>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                  {t("contract_number")}
                </p>
                <h1 className="text-3xl font-semibold text-scene-content">
                  CT-{String(data.id).padStart(5, "0")}
                </h1>
                <p className="text-sm text-subtle">
                  {data.tenant_name} · {data.property_name || "—"} · {data.unit_code || "—"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge value={data.status} options={contractStatusItems} />
                <button
                  type="button"
                  onClick={() => setPdfOpen(true)}
                  className="btn btn-outline"
                >
                  <Icon name="visibility" className="text-lg" />
                  <span>{t("view_pdf")}</span>
                </button>
              </div>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {summaryCards.map(([k, v]) => (
              <div key={k} className="rounded-xl bg-scene p-4">
                <p className="text-sm text-subtle">{k}</p>
                <p className="mt-2 text-xl font-semibold text-scene-content">{v}</p>
              </div>
            ))}
          </div>

          <form onSubmit={save} className="space-y-6">
            <section className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-scene-content">{t("contract_terms")}</h2>
                <p className="mt-1 text-sm text-subtle">{t("contract_detail_description")}</p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {fields.map(([k, tk, type]) => (
                  <div key={k} className={field}>
                    <label className={label} htmlFor={k}>
                      {t(tk)}
                    </label>
                    <Input
                      name={k}
                      label={t(k)}
                      type={type}
                      value={form[k]}
                      onChange={(v) => setDraft({ ...form, [k]: v })}
                      required
                      min={k === "billing_day" ? 1 : 0}
                      max={k === "billing_day" ? 28 : undefined}
                      step={k === "monthly_rent" || k === "security_deposit" ? "0.01" : undefined}
                    />
                  </div>
                ))}

                <div className={field}>
                  <label className={label} htmlFor="status">
                    {t("status")}
                  </label>
                  <Select
                    name="status"
                    label={t("status")}
                    value={form.status}
                    onChange={(status) => setDraft({ ...form, status })}
                    options={contractStatusItems}
                  />
                </div>
              </div>

              <Textarea
                name="notes"
                label={t("notes")}
                rows={4}
                value={form.notes}
                onChange={(v) => setDraft({ ...form, notes: v })}
              />
            </section>

            <div className="flex flex-wrap justify-end gap-3 border-t border-scene pt-5">
              <Link href="/contracts" className="btn btn-outline">
                {t("cancel")}
              </Link>
              <button type="submit" disabled={submitting} className="btn btn-primary disabled:opacity-50">
                {submitting ? t("saving") : t("save_changes")}
              </button>
            </div>
          </form>
        </section>
      </div>

      <PdfPreviewModal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        title={t("lease_agreement_summary")}
        fileName={"lease-summary-" + contractRef(data.id)}
        build={() => buildContractPdf(data)}
      />
    </main>
  );
}