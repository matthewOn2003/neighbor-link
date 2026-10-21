"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { useToast } from "@/components/ui";
import { PdfPreviewModal } from "@/components/ui/PdfPreviewModal";
import { buildSimplePdf } from "@/utils/pdf";

const money = (value, locale) =>
  "RM " + Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusKeys = {
  draft: "contract_status_draft",
  active: "contract_status_active",
  expired: "contract_status_expired",
  terminated: "contract_status_terminated",
};

const contractRef = (id) => "CT-" + String(id).padStart(5, "0");
const pdfMoney = (value) => "RM " + (Number(value) || 0).toFixed(2);
const pdfContractStatus = { draft: "Draft", active: "Active", expired: "Expired", terminated: "Terminated" };

// Contract summary PDF: English labels and values only (the built-in PDF font is Latin-only).
// tenant is the /tenant/detail response (used for email); it may be null.
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

export default function ContractsPage() {
  const { t, locale } = useLocale();
  const toast = useToast();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({ keyword: "", status: "" });
  const [pdfContract, setPdfContract] = useState(null);
  const statusOptions = [
    { value: "", label: t("all_contract_statuses") },
    ...["draft", "active", "expired", "terminated"].map((value) => ({ value, label: t(statusKeys[value]) })),
  ];

  async function activate(contract, reload) {
    try {
      await request("/contract/update/" + contract.id, {
        tenant_id: contract.tenant_id,
        start_date: contract.start_date,
        end_date: contract.end_date,
        monthly_rent: contract.monthly_rent,
        security_deposit: contract.security_deposit,
        billing_day: contract.billing_day,
        status: "active",
        notes: contract.notes || "",
      });
      toast.success(t("contract_activated"));
      reload();
    } catch (error) {
      toast.error(error.code === "ACTIVE_CONTRACT_EXISTS" ? t("contract_active_exists") : t("contract_save_failed"));
    }
  }

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api="/contract/list"
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "keyword", label: t("search_keyword") },
            { key: "status", label: t("status"), display: (value) => t(statusKeys[value] ?? value) },
          ]}
          onClearFilter={clear}
          title={t("contracts")}
          description={t("contracts_description")}
          buttons={(
            <Link className="btn btn-primary" href="/contracts/new">
              <Icon name="add" className="text-lg" />
              <span>{t("new_contract")}</span>
            </Link>
          )}
          filters={(
            <>
              <Input
                variant="filter"
                name="keyword"
                label={t("search_keyword")}
                value={draft.keyword}
                placeholder={t("search_contracts")}
                onChange={(keyword) => setDraft((current) => ({ ...current, keyword }))}
              />

              <Select
                variant="filter"
                name="status"
                label={t("status")}
                value={draft.status}
                onChange={(status) => setDraft((current) => ({ ...current, status }))}
                options={statusOptions}
              />
            </>
          )}
          resetFilters={reset}
          applyFilters={apply}
          emptyText={t("no_contracts")}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              {["contract_number", "tenant", "property_and_unit", "contract_term", "monthly_rent", "status", "action"].map((key) => (
                <th key={key}>{t(key)}</th>
              ))}
            </tr>
          )}
          body={({ rows, reload }) =>
            rows.map((contract) => (
              <tr className="group" key={contract.id}>
                <td className="font-semibold whitespace-nowrap">
                  <Link href={"/contracts/" + contract.id} className="text-primary-dark hover:underline">{contractRef(contract.id)}</Link>
                </td>
                <td>
                  <div className="font-semibold text-scene-content">{contract.tenant_name}</div>
                  <div className="text-xs text-subtle">{contract.tenant_phone || "—"}</div>
                </td>
                <td>
                  <div>{contract.property_name || "—"}</div>
                  <div className="text-xs text-subtle">{contract.unit_code || "—"}</div>
                </td>
                <td className="whitespace-nowrap">{contract.start_date} – {contract.end_date}</td>
                <td className="whitespace-nowrap font-semibold">{money(contract.monthly_rent, locale)}</td>
                <td><span className={"status-pill " + (contract.status === "active" ? "success" : contract.status === "expired" ? "warning" : "neutral")}>{t(statusKeys[contract.status] || statusKeys.draft)}</span></td>
                <td className="whitespace-nowrap">
                  <Link href={"/contracts/" + contract.id} className="text-primary-dark hover:underline">{t("view_details")}</Link>
                  <button type="button" aria-label={t("view_pdf")} title={t("view_pdf")} className="ml-3 align-middle text-primary-dark hover:text-scene-content" onClick={() => setPdfContract(contract)}><Icon name="visibility" className="text-lg" /></button>
                  {contract.status === "draft" ? <button type="button" className="ml-3 text-primary-dark hover:underline" onClick={() => activate(contract, reload)}>{t("activate_contract")}</button> : null}
                </td>
              </tr>
            ))
          }
        />
      </div>

      <PdfPreviewModal
        open={Boolean(pdfContract)}
        onClose={() => setPdfContract(null)}
        title={t("lease_agreement_summary")}
        fileName={pdfContract ? "lease-summary-" + contractRef(pdfContract.id) : "lease-summary"}
        build={() => buildContractPdf(pdfContract)}
      />
    </main>
  );
}
