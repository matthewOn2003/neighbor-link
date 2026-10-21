"use client";

import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { money } from "@/components/payments/shared";
import { formatDate, monthOf } from "./format";
import { BILL_LABEL_KEY, BILL_TONE } from "./status";
import { GlassCard, PrimaryButton, Pill, TILE_CLASSES } from "./primitives";

export default function BillCard({ bill, onUpload }) {
  const { t, locale } = useLocale();
  const status = bill.display_status;
  const tone = BILL_TONE[status] ?? "neutral";
  const payable = bill.outstanding > 0 && status !== "paid" && status !== "void" && status !== "pending_review";

  return (
    <GlassCard className="relative overflow-hidden p-4">
      <div className="flex items-start justify-between gap-2">
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
        <div className="shrink-0 text-right">
          <p className="text-sm font-extrabold text-on-surface">{money(bill.amount, locale)}</p>
          <p className="text-[10px] uppercase tracking-wider text-on-surface-variant">
            {status === "paid" ? t("portal_cleared") : t("bill_total_amount")}
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-white/[0.06] rounded-xl border border-white/[0.05] bg-black/30">
        <LedgerCell label={t("late_fee")} value={money(bill.late_fee, locale)} />
        <LedgerCell label={t("amount_paid")} value={money(bill.amount_paid, locale)} />
        <LedgerCell label={t("outstanding")} value={money(bill.outstanding, locale)} />
      </div>

      {payable ? (
        <div className="mt-4 flex justify-end">
          <PrimaryButton onClick={() => onUpload(bill.id)}>
            <Icon name="upload_file" className="text-[18px]" />
            {t("portal_upload_proof")}
          </PrimaryButton>
        </div>
      ) : null}
    </GlassCard>
  );
}

function LedgerCell({ label, value }) {
  return (
    <div className="px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</p>
      <p className="mt-1 text-xs font-bold text-on-surface">{value}</p>
    </div>
  );
}
