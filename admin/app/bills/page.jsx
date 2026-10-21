"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { PdfPreviewModal } from "@/components/ui/PdfPreviewModal";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useLocale } from "@/i18n";
import { buildSimplePdf } from "@/utils/pdf";

const money = (value, locale) =>
  "RM " + Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusKeys = {
  unpaid: "bill_status_unpaid",
  partial: "bill_status_partial",
  paid: "bill_status_paid",
  overdue: "bill_status_overdue",
  void: "bill_status_void",
  pending_review: "bill_status_pending_review",
};
const statusClass = { unpaid: "neutral", partial: "warning", paid: "success", overdue: "danger", void: "neutral", pending_review: "warning" };

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

export default function BillsPage() {
  const { t, locale } = useLocale();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({ keyword: "", status: "", period: "" });
  const [pdfBill, setPdfBill] = useState(null);
  const statusOptions = [
    { value: "", label: t("all_bill_statuses") },
    ...["unpaid", "partial", "paid", "overdue", "void"].map((value) => ({ value, label: t(statusKeys[value]) })),
  ];

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api="/bill/list"
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "keyword", label: t("search_keyword") },
            { key: "status", label: t("status"), display: (value) => t(statusKeys[value] ?? value) },
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
              <SummaryCard label={t("bill_total_amount")} value={money(stats.total_amount, locale)} icon="receipt_long" />
              <SummaryCard label={t("bill_total_paid")} value={money(stats.total_paid, locale)} icon="task_alt" />
              <SummaryCard label={t("bill_outstanding")} value={money(stats.outstanding, locale)} icon="account_balance_wallet" />
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
                    <Link href={"/bills/" + bill.id} className="text-primary-dark hover:underline">{billRef(bill.id)}</Link>
                  </td>
                  <td>
                    <div className="font-semibold text-scene-content">{bill.tenant_name}</div>
                    <div className="text-xs text-subtle">{bill.property_name || "—"} · {bill.unit_code || "—"}</div>
                  </td>
                  <td className="whitespace-nowrap">{bill.billing_period}</td>
                  <td className="whitespace-nowrap">{bill.due_date}</td>
                  <td className="whitespace-nowrap font-semibold">{money(Number(bill.amount) + Number(bill.late_fee), locale)}</td>
                  <td className="whitespace-nowrap">{money(bill.amount_paid, locale)}</td>
                  <td><span className={"status-pill " + (statusClass[displayStatus] || "neutral")}>{t(statusKeys[displayStatus] || statusKeys.unpaid)}</span></td>
                  <td className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Link href={"/bills/" + bill.id} className="text-primary-dark hover:underline">{t("view_details")}</Link>
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
