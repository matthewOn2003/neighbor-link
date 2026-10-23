"use client";

import { useLocale } from "@/i18n";
import { money } from "@/components/payments/shared";
import { useApiRequest } from "@/hooks/useApiRequest";
import { formatDate } from "./format";
import { BILL_LABEL_KEY, BILL_TONE } from "./status";
import { EmptyState, GhostButton, LoadingBlock, Pill, Sheet } from "./primitives";

const LINE_LABEL_KEY = {
  rent: "portal_invoice_line_rent",
  late_fee: "portal_invoice_line_late_fee",
};

/** Statement of one bill: who it is billed to, the charges, and what has been paid. */
export default function InvoiceSheet({ billId, onClose }) {
  const { t, locale } = useLocale();
  const { data, loading } = useApiRequest(`/tenant-portal/bills/detail/${billId}`, {});
  const tone = BILL_TONE[data?.status] ?? "neutral";

  return (
    <Sheet
      open
      onClose={onClose}
      icon="receipt"
      title={t("portal_invoice")}
      subtitle={data?.number}
      footer={<GhostButton onClick={onClose}>{t("close")}</GhostButton>}
    >
      {loading && !data ? <LoadingBlock rows={3} /> : null}
      {!loading && !data ? <EmptyState icon="error" title={t("record_not_found")} /> : null}
      {data ? (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Info label={t("portal_invoice_number")} value={data.number} />
            <Info label={t("portal_invoice_period")} value={data.billing_period} />
            <Info label={t("due_date")} value={formatDate(data.due_date, locale)} />
            <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("status")}</p>
              <div className="mt-1.5">
                <Pill tone={tone}>{t(BILL_LABEL_KEY[data.status] ?? "bill_display_unpaid")}</Pill>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("portal_invoice_billed_to")}</p>
            <p className="mt-1 text-sm font-bold text-on-surface">{data.tenant_name}</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              {[data.property_name, data.unit_code].filter(Boolean).join(" • ")}
            </p>
            {data.property_address ? <p className="mt-0.5 text-xs text-on-surface-variant">{data.property_address}</p> : null}
          </div>

          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("portal_invoice_charges")}</p>
            <ul className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.06] bg-black/30">
              {data.lines.map((line) => (
                <li key={line.kind} className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs">
                  <span className="text-on-surface">{t(LINE_LABEL_KEY[line.kind] ?? "portal_invoice_line_rent")}</span>
                  <span className="font-semibold text-on-surface">{money(line.amount, locale)}</span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-black/30 p-3.5 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-on-surface-variant">{t("portal_invoice_total")}</dt>
              <dd className="font-semibold text-on-surface">{money(data.total, locale)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-on-surface-variant">{t("amount_paid")}</dt>
              <dd className="font-semibold text-on-surface">{money(data.paid, locale)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
              <dt className="font-bold text-on-surface">{t("outstanding")}</dt>
              <dd className="font-extrabold text-on-surface">{money(data.outstanding, locale)}</dd>
            </div>
          </dl>
        </div>
      ) : null}
    </Sheet>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="mt-1 text-xs font-semibold text-on-surface">{value}</p>
    </div>
  );
}
