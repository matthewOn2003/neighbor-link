"use client";

import { useLocale } from "@/i18n";
import { useApiRequest } from "@/hooks/useApiRequest";
import { fdl } from "@/utils/date";
import { buildSimplePdf } from "@/utils/pdf";
import { formatMoney } from "@/utils/format";

export const money = (value, locale) => formatMoney(value, locale);

export const receiptNumber = (id) => `RCPT-${String(id).padStart(6, "0")}`;

export const METHOD_KEYS = {
  bank_transfer: "payment_bank_transfer",
  cash: "payment_cash",
  online: "payment_online",
  other: "payment_other",
};

export function methodLabel(t, method) {
  if (!method) return "-";
  return METHOD_KEYS[method] ? t(METHOD_KEYS[method]) : method;
}

export const labelFor = (options, value) => options.find((option) => option.value === value)?.label ?? value;

// 后端 proof 与 payment 列表的筛选参数：物业 property_id、单元 unit_id（字符串）
export function usePropertyOptions() {
  const { t } = useLocale();
  const { data } = useApiRequest("/property/list", { per_page: 100 });
  return [
    { value: "", label: t("all_properties") },
    ...(data?.list ?? []).map((property) => ({ value: String(property.id), label: property.name })),
  ];
}

// 未选物业时不展示单元，选定物业后才列出该物业的单元
export function useUnitOptions(propertyId) {
  const { t } = useLocale();
  const { data } = useApiRequest("/property/unit/list", { property_id: propertyId, per_page: 100 });
  const units = propertyId ? (data?.list ?? []) : [];
  return [
    { value: "", label: t("all_units") },
    ...units.map((unit) => ({ value: String(unit.id), label: unit.code })),
  ];
}

export function buildReceipt(row, t, locale) {
  return buildSimplePdf({
    title: t("payment_receipt"),
    subtitle: receiptNumber(row.id),
    sections: [
      {
        heading: t("payment_receipt"),
        rows: [
          [t("receipt_number"), receiptNumber(row.id)],
          [t("tenant_name"), row.tenant_name],
          [t("property_and_unit"), [row.property_name, row.unit_code].filter(Boolean).join(" ")],
          [t("billing_period"), row.bill_period],
          [t("payment_amount"), money(row.amount, locale)],
          [t("payment_method"), methodLabel(t, row.method)],
          [t("payment_reference"), row.reference],
          [t("paid_at"), fdl(row.paid_at)],
        ],
      },
    ],
  });
}
