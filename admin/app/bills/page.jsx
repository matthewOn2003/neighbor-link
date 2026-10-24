"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDropdown } from "@/hooks/useDropdown";
import { PdfPreviewModal } from "@/components/ui/PdfPreviewModal";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useLocale } from "@/i18n";
import { billRef, buildInvoicePdf } from "@/utils/documents";
import { formatMoney } from "@/utils/format";


export default function BillsPage() {
  const { t, locale } = useLocale();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({ keyword: "", status: "", period: "" });
  const [pdfBill, setPdfBill] = useState(null);
  const { optionsOf, labelOf } = useDropdown(["bill_status"]);
  const billStatusItems = optionsOf("bill_status");
  const statusOptions = [{ value: "", label: t("all_bill_statuses") }, ...billStatusItems];

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api="/bill/list"
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "keyword", label: t("search_keyword") },
            { key: "status", label: t("status"), display: (value) => labelOf("bill_status", value) },
            { key: "period", label: t("billing_period") },
          ]}
          onClearFilter={clear}
          title={t("bills")}
          description={t("bills_description")}
          buttons={(
            <>
              <Link href="/bills/generate" className="btn btn-outline">
                <Icon name="autorenew" className="text-lg" />
                <span>{t("generate_monthly_bills")}</span>
              </Link>
              <Link href="/bills/new" className="btn btn-primary">
                <Icon name="add" className="text-lg" />
                <span>{t("create_bill")}</span>
              </Link>
            </>
          )}
          filters={(
            <>
              <Input
                variant="filter"
                name="keyword"
                label={t("search_keyword")}
                value={draft.keyword}
                placeholder={t("search_bills")}
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

              <Input
                variant="filter"
                type="month"
                name="period"
                label={t("billing_period")}
                value={draft.period}
                onChange={(period) => setDraft((current) => ({ ...current, period }))}
              />
            </>
          )}
          resetFilters={reset}
          applyFilters={apply}
          emptyText={t("no_bills")}
          summary={({ summary }) => {
            const stats = summary ?? {};
            return (
            <>
              <SummaryCard label={t("bill_total_amount")} value={formatMoney(stats.total_amount, locale)} icon="receipt_long" />
              <SummaryCard label={t("bill_total_paid")} value={formatMoney(stats.total_paid, locale)} icon="task_alt" />
              <SummaryCard label={t("bill_outstanding")} value={formatMoney(stats.outstanding, locale)} icon="account_balance_wallet" />
              <SummaryCard label={t("bill_overdue_count")} value={String(stats.overdue_count ?? 0)} icon="schedule" />
            </>
            );
          }}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              {["bill_number", "tenant", "billing_period", "due_date", "bill_amount", "bill_paid", "status", "action"].map((key) => (
                <th key={key}>{t(key)}</th>
              ))}
            </tr>
          )}
          body={({ rows }) =>
            rows.map((bill) => {
              const displayStatus = bill.display_status || bill.status;
              return (
                <tr className="group" key={bill.id}>
                  <td className="font-semibold whitespace-nowrap">
                    <Link href={"/bills/" + bill.id} className="link-inline">{billRef(bill.id)}</Link>
                  </td>
                  <td>
                    <div className="font-semibold text-scene-content">{bill.tenant_name}</div>
                    <div className="text-xs text-subtle">{bill.property_name || "—"} · {bill.unit_code || "—"}</div>
                  </td>
                  <td className="whitespace-nowrap">{bill.billing_period}</td>
                  <td className="whitespace-nowrap">{bill.due_date}</td>
                  <td className="whitespace-nowrap font-semibold">{formatMoney(Number(bill.amount) + Number(bill.late_fee), locale)}</td>
                  <td className="whitespace-nowrap">{formatMoney(bill.amount_paid, locale)}</td>
                  <td><StatusBadge value={displayStatus} options={billStatusItems} /></td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Link href={"/bills/" + bill.id} className="link-inline">{t("view_details")}</Link>
                      <button
                        type="button"
                        aria-label={t("view_pdf")}
                        title={t("view_pdf")}
                        onClick={() => setPdfBill(bill)}
                        className="text-primary-dark hover:text-scene-content"
                      >
                        <Icon name="visibility" className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          }
        />
      </div>

      <PdfPreviewModal
        open={Boolean(pdfBill)}
        onClose={() => setPdfBill(null)}
        title={t("invoice")}
        fileName={pdfBill ? "invoice-" + billRef(pdfBill.id) : "invoice"}
        build={() => buildInvoicePdf(pdfBill)}
      />
    </main>
  );
}
