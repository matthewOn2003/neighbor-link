"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { wholeMoney } from "@/components/portal/format";
import { useApiData } from "@/hooks/useApiData";
import BillCard from "@/components/portal/BillCard";
import ProofCard from "@/components/portal/ProofCard";
import PaymentProofSheet from "@/components/portal/PaymentProofSheet";
import InvoiceSheet from "@/components/portal/InvoiceSheet";
import { EmptyState, FilterChips, GlassCard, LoadingBlock, SegmentedTabs, Stagger } from "@/components/portal/primitives";

export default function BillingPage() {
  return (
    <Suspense fallback={null}>
      <BillingContent />
    </Suspense>
  );
}

function BillingContent() {
  const { t, locale } = useLocale();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("bills");
  const [filter, setFilter] = useState("all");
  const [invoiceBillId, setInvoiceBillId] = useState(null);
  // The home screen's "Submit Proof" action opens this sheet with ?sheet=proof.
  const [sheet, setSheet] = useState(() => (searchParams.get("sheet") === "proof" ? { billId: null } : null)); // null when closed; { billId } when open
  const bills = useApiData("/tenant-portal/bills", { current_page: 1, per_page: 100 });
  const proofs = useApiData("/tenant-portal/payment-proof/list", { current_page: 1, per_page: 100 });

  const billList = bills.data?.list ?? [];
  const proofList = proofs.data?.list ?? [];
  const proofTotal = proofs.data?.pagination?.total ?? 0;

  // Oldest bill that needs attention: overdue first, otherwise waiting for review.
  const actionBill = [...billList].reverse().find((b) => b.display_status === "overdue" || b.display_status === "pending_review");
  const declined = proofList.find((p) => p.status === "rejected" && p.bill_id === actionBill?.id);
  // An overdue bill gets its upload button in the banner, so the page does not repeat it below.
  const bannerUpload = actionBill?.display_status === "overdue";
  const periodOf = Object.fromEntries(billList.map((b) => [b.id, b.billing_period]));

  const counts = billList.reduce((acc, b) => {
    acc[b.display_status] = (acc[b.display_status] ?? 0) + 1;
    return acc;
  }, {});
  const filterItems = [
    { key: "all", label: t("all_bill_statuses"), count: billList.length },
    { key: "overdue", label: t("bill_display_overdue"), count: counts.overdue ?? 0 },
    { key: "paid", label: t("bill_display_paid"), count: counts.paid ?? 0 },
    { key: "pending_review", label: t("bill_display_pending_review"), count: counts.pending_review ?? 0 },
  ];
  const visibleBills = filter === "all" ? billList : billList.filter((b) => b.display_status === filter);

  const loading = (bills.loading && !bills.data) || (proofs.loading && !proofs.data);

  return (
    <div className="flex flex-col gap-5">
      {actionBill ? (
        <GlassCard className="relative overflow-hidden border-rose-500/20 p-4">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-rose-500/20 blur-2xl" />
          <div className="relative flex items-start gap-3.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-rose-500/30 to-rose-500/5 text-rose-200">
              <Icon name="warning" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-200">
                  {actionBill.display_status === "overdue" ? t("portal_action_required") : t("portal_under_review")}
                </span>
                <span className="text-[11px] text-on-surface-variant">{t("due_date")}: {actionBill.due_date}</span>
              </div>
              <p className="mt-1 text-sm font-bold text-on-surface">
                {wholeMoney(actionBill.outstanding, locale)} {actionBill.display_status === "overdue" ? t("bill_display_overdue") : ""}
              </p>
              <p className="mt-1 text-xs text-on-surface-variant">
                {declined ? `${t("portal_proof_declined", { period: actionBill.billing_period })} ${declined.reject_reason}` : t("portal_bill_due_hint")}
              </p>
              {bannerUpload ? (
                <button
                  type="button"
                  onClick={() => setSheet({ billId: actionBill.id })}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-primary-container px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-primary-container/30 active:scale-[0.98]"
                >
                  <Icon name="upload_file" className="text-[16px]" />
                  {t("portal_upload_proof")}
                </button>
              ) : null}
            </div>
          </div>
        </GlassCard>
      ) : null}

      {!bannerUpload ? (
        <button
          type="button"
          onClick={() => setSheet({ billId: null })}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-container py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-container/30 transition-all active:scale-[0.98]"
        >
          <Icon name="add_a_photo" className="text-[18px]" />
          {t("submit_payment_proof")}
        </button>
      ) : null}

      <SegmentedTabs
        value={tab}
        onChange={setTab}
        items={[
          { key: "bills", label: t("portal_monthly_bills"), icon: "event_repeat", count: billList.length },
          { key: "proofs", label: t("payment_proofs"), icon: "receipt_long", count: proofTotal },
        ]}
      />

      {tab === "bills" ? <FilterChips items={filterItems} value={filter} onChange={setFilter} /> : null}

      {loading ? <LoadingBlock /> : null}

      {!loading && tab === "bills" ? (
        visibleBills.length === 0 ? (
          <EmptyState icon="receipt_long" title={t("no_bills")} />
        ) : (
          <div className="flex flex-col gap-3">
            {visibleBills.map((bill, index) => (
              <Stagger key={bill.id} index={index}>
                <BillCard
                  key={bill.id}
                  bill={bill}
                  onUpload={(billId) => setSheet({ billId })}
                  onInvoice={(billId) => setInvoiceBillId(billId)}
                />
              </Stagger>
            ))}
          </div>
        )
      ) : null}

      {!loading && tab === "proofs" ? (
        proofList.length === 0 ? (
          <EmptyState icon="fact_check" title={t("no_payment_proofs")} />
        ) : (
          <div className="flex flex-col gap-3">
            {proofList.map((proof, index) => (
              <Stagger key={proof.id} index={index}>
                <ProofCard
                  key={proof.id}
                  proof={proof}
                  billPeriod={periodOf[proof.bill_id]}
                  onReupload={(billId) => setSheet({ billId })}
                />
              </Stagger>
            ))}
          </div>
        )
      ) : null}

      {invoiceBillId ? <InvoiceSheet billId={invoiceBillId} onClose={() => setInvoiceBillId(null)} /> : null}

      {sheet ? (
        <PaymentProofSheet
          bills={billList}
          initialBillId={sheet.billId}
          onClose={() => setSheet(null)}
          onSubmitted={() => {
            setSheet(null);
            bills.reload();
            proofs.reload();
          }}
        />
      ) : null}
    </div>
  );
}
