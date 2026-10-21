"use client";

import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { money } from "@/components/payments/shared";
import { formatDate, monthOf } from "./format";
import { BILL_LABEL_KEY, BILL_TONE } from "./status";
import { GhostButton, GlassCard, PrimaryButton, Pill, TILE_CLASSES } from "./primitives";

export default function BillCard({ bill, onUpload, onInvoice }) {
  const { t, locale } = useLocale();
  const status = bill.display_status;
  const tone = BILL_TONE[status] ?? "neutral";
  const payable = bill.outstanding > 0 && status !== "paid" && status !== "void" && status !== "pending_review";
  const owing = bill.outstanding > 0;

  return (
    <GlassCard className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl border bg-gradient-to-br text-sm font-bold ${TILE_CLASSES[tone]}`}>
          {monthOf(bill.billing_period)}
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-on-surface">{bill.billing_period}</span>
            <Pill tone={tone}>{t(BILL_LABEL_KEY[status] ?? "bill_display_unpaid")}</Pill>
          </div>
          <p className="mt-0.5 text-xs text-on-surface-variant">
            {t("due_date")}: {formatDate(bill.due_date, locale)}
          </p>
        </div>
      </div>

      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
          {owing ? t("outstanding") : t("portal_cleared")}
        </p>
        <p className="mt-1 text-xl font-extrabold text-on-surface">{money(owing ? bill.outstanding : bill.amount, locale)}</p>
      </div>

      <div className={`grid gap-2.5 ${payable ? "grid-cols-2" : "grid-cols-1"}`}>
        <GhostButton onClick={() => onInvoice(bill.id)}>
          <Icon name="receipt" className="text-[18px] text-on-surface-variant" />
          {t("portal_invoice")}
        </GhostButton>
        {payable ? (
          <PrimaryButton onClick={() => onUpload(bill.id)}>
            <Icon name="upload_file" className="text-[18px]" />
            {t("portal_upload_proof")}
          </PrimaryButton>
        ) : null}
      </div>
    </GlassCard>
  );
}
