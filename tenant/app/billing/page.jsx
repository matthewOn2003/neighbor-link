"use client";

import { useLocale } from "@/i18n";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Select";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { fdl } from "@/utils/date";
import { money } from "@/components/payments/shared";

const BILL_STATUSES = ["unpaid", "partial", "paid", "overdue", "pending_review", "void"];
const statusClass = {
  unpaid: "neutral",
  partial: "warning",
  paid: "success",
  overdue: "danger",
  pending_review: "warning",
  void: "neutral",
};

export default function BillingPage() {
  const { t, locale } = useLocale();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({ status: "" });
  const statusOptions = [
    { value: "", label: t("all_statuses") },
    ...BILL_STATUSES.map((value) => ({ value, label: t(`bill_display_${value}`) })),
  ];
  const labelFor = (value) => statusOptions.find((option) => option.value === value)?.label ?? value;
  const update = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api="/tenant-portal/bills"
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "status", label: t("status"), display: labelFor },
          ]}
          onClearFilter={clear}
          title={t("menu_billing")}
          description={t("billing_description")}
          summary={({ total }) => (
            <SummaryCard label={t("total_bills")} value={total} icon="receipt_long" />
          )}
          emptyText={t("no_bills")}
          filters={(
            <Select variant="filter" name="status" label={t("status")} value={draft.status} onChange={update("status")} options={statusOptions} />
          )}
          resetFilters={reset}
          applyFilters={apply}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              <th>{t("billing_period")}</th>
              <th>{t("due_date")}</th>
              <th>{t("amount")}</th>
              <th>{t("late_fee")}</th>
              <th>{t("amount_paid")}</th>
              <th>{t("outstanding")}</th>
              <th>{t("status")}</th>
              <th>{t("pending_proofs")}</th>
            </tr>
          )}
          body={({ rows }) =>
            rows.map((bill) => (
              <tr key={bill.id} className="group">
                <td className="font-semibold text-scene-content">{bill.billing_period}</td>
                <td className="whitespace-nowrap text-subtle">{fdl(bill.due_date)}</td>
                <td className="text-scene-content">{money(bill.amount, locale)}</td>
                <td className="text-scene-content">{money(bill.late_fee, locale)}</td>
                <td className="text-scene-content">{money(bill.amount_paid, locale)}</td>
                <td className="font-semibold text-scene-content">{money(bill.outstanding, locale)}</td>
                <td>
                  <span className={`status-pill ${statusClass[bill.display_status] || "neutral"}`}>
                    {t(`bill_display_${bill.display_status}`)}
                  </span>
                </td>
                <td className="text-center text-scene-content">{bill.pending_proofs || 0}</td>
              </tr>
            ))
          }
        />
      </div>
    </main>
  );
}
