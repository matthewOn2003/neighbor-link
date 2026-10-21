"use client";

import { useState } from "react";
import { DataTable, Input, Select } from "@/components/ui";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { PdfPreviewModal } from "@/components/ui/PdfPreviewModal";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { fdl } from "@/utils/date";
import {
  buildReceipt,
  labelFor,
  methodLabel,
  money,
  receiptNumber,
  usePropertyOptions,
  useUnitOptions,
} from "@/components/payments/shared";

function ReceiptsTab() {
  const { t, locale } = useLocale();
  const propertyOptions = usePropertyOptions();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({
    keyword: "",
    property_id: "",
    unit_id: "",
    paid_from: "",
    paid_to: "",
    amount_min: "",
    amount_max: "",
  });
  const unitOptions = useUnitOptions(draft.property_id);
  const [receipt, setReceipt] = useState(null);

  const update = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <>
      <DataTable
        api="/payment/list"
        params={applied}
        filterValues={draft}
        filterBadges={[
          { key: "keyword", label: t("search_keyword") },
          { key: "property_id", label: t("property"), display: (value) => labelFor(propertyOptions, value) },
          { key: "unit_id", label: t("unit"), display: (value) => labelFor(unitOptions, value) },
          { key: "paid_from", label: t("paid_from") },
          { key: "paid_to", label: t("paid_to") },
          { key: "amount_min", label: t("amount_min") },
          { key: "amount_max", label: t("amount_max") },
        ]}
        onClearFilter={clear}
        exportConfig={{
          filename: "payment-receipts",
          columns: [
            { label: t("tenant_name"), get: (r) => r.tenant_name },
            { label: t("property"), get: (r) => r.property_name },
            { label: t("unit"), get: (r) => r.unit_code },
            { label: t("billing_period"), get: (r) => r.bill_period },
            { label: t("payment_amount"), get: (r) => r.amount },
            { label: t("payment_method"), get: (r) => methodLabel(t, r.method) },
            { label: t("payment_reference"), get: (r) => r.reference },
            { label: t("paid_at"), get: (r) => fdl(r.paid_at) },
          ],
        }}
        title={t("payments")}
        description={t("payments_description")}
        emptyText={t("no_payment_records")}
        filters={(
          <>
            <Input
              variant="filter"
              name="keyword"
              label={t("search_keyword")}
              value={draft.keyword}
              placeholder={t("search_payments")}
              onChange={update("keyword")}
            />
            <Select
              variant="filter"
              name="property_id"
              label={t("property")}
              value={draft.property_id}
              onChange={(value) => {
                update("property_id")(value);
                update("unit_id")("");
              }}
              options={propertyOptions}
            />
            <Select variant="filter" name="unit_id" label={t("unit")} value={draft.unit_id} onChange={update("unit_id")} options={unitOptions} />
            <DatePicker variant="filter" name="paid_from" label={t("paid_from")} value={draft.paid_from} max={draft.paid_to || undefined} onChange={update("paid_from")} />
            <DatePicker variant="filter" name="paid_to" label={t("paid_to")} value={draft.paid_to} min={draft.paid_from || undefined} onChange={update("paid_to")} />
            <Input variant="filter" name="amount_min" type="number" label={t("amount_min")} value={draft.amount_min} onChange={update("amount_min")} />
            <Input variant="filter" name="amount_max" type="number" label={t("amount_max")} value={draft.amount_max} onChange={update("amount_max")} />
          </>
        )}
        resetFilters={reset}
        applyFilters={apply}
        buttons={(
          <>
            <Link className="btn btn-outline" href="/payments/settings">
              <Icon name="settings" className="text-lg" />
              <span>{t("collection_settings")}</span>
            </Link>
          </>
        )}
        header={() => (
          <tr className="bg-accent text-subtle font-semibold">
            <th>{t("tenant_name")}</th>
            <th>{t("property_and_unit")}</th>
            <th>{t("billing_period")}</th>
            <th>{t("payment_amount")}</th>
            <th>{t("payment_method")}</th>
            <th>{t("payment_reference")}</th>
            <th>{t("paid_at")}</th>
            <th>{t("action")}</th>
          </tr>
        )}
        body={({ rows }) =>
          rows.map((row) => (
            <tr key={row.id} className="group">
              <td className="font-semibold text-scene-content">{row.tenant_name}</td>
              <td>
                <div className="flex flex-col">
                  <span className="text-scene-content">{row.property_name || "-"}</span>
                  <span className="text-subtle text-xs">{row.unit_code || "-"}</span>
                </div>
              </td>
              <td className="text-scene-content">{row.bill_period}</td>
              <td className="text-scene-content">{money(row.amount, locale)}</td>
              <td className="text-subtle">{methodLabel(t, row.method)}</td>
              <td className="text-subtle">{row.reference || "-"}</td>
              <td className="whitespace-nowrap text-subtle">{fdl(row.paid_at)}</td>
              <td>
                <div className="flex justify-center items-center gap-2">
                  <button
                    type="button"
                    className="btn btn-primary !p-0 size-10 grid place-items-center"
                    aria-label={t("view_receipt")}
                    onClick={() => setReceipt(row)}
                  >
                    <Icon name="visibility" className="text-lg" />
                  </button>
                </div>
              </td>
            </tr>
          ))
        }
      />

      <PdfPreviewModal
        open={Boolean(receipt)}
        onClose={() => setReceipt(null)}
        title={t("view_receipt")}
        fileName={receipt ? receiptNumber(receipt.id) : "receipt"}
        build={() => buildReceipt(receipt, t, locale)}
      />
    </>
  );
}

export default function PaymentsPage() {
  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <ReceiptsTab />
      </div>
    </main>
  );
}
