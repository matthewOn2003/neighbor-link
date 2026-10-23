"use client";

import { useState } from "react";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { money } from "@/components/payments/shared";
import { createPaymentProof } from "@/services/tenant-portal/paymentProof";
import { todayKL } from "./format";
import { useTOr } from "./status";
import { Field, GhostButton, PrimaryButton, Sheet, inputClass } from "./primitives";
import { Input, Select } from "../ui";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** Bills that can take a proof: money still owed and nothing already waiting for review. */
export function payableBills(bills) {
  return bills.filter((b) => b.outstanding > 0 && !["paid", "void", "pending_review"].includes(b.display_status));
}

/**
 * Submit a bank-transfer proof for one bill. The parent mounts this only while it is open,
 * so the form always starts from the preselected bill.
 */
export default function PaymentProofSheet({ bills, initialBillId, onClose, onSubmitted }) {
  const { t, locale } = useLocale();
  const tOr = useTOr();
  const toast = useToast();
  const payable = payableBills(bills);
  const initial = payable.find((b) => b.id === initialBillId) ?? payable[0];

  const [billId, setBillId] = useState(initial?.id ?? null);
  const [amount, setAmount] = useState(initial ? String(initial.outstanding.toFixed(2)) : "");
  const [paidAt, setPaidAt] = useState(todayKL());
  const [reference, setReference] = useState("");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const selected = payable.find((b) => b.id === billId) ?? null;

  function changeBill(id) {
    const next = payable.find((b) => b.id === Number(id));
    setBillId(next?.id ?? null);
    setAmount(next ? String(next.outstanding.toFixed(2)) : "");
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    const value = Number(amount);
    if (!selected) return setError(t("portal_select_bill"));
    if (!(value > 0) || value > selected.outstanding + 0.000001) return setError(t("proof_error_INVALID_AMOUNT"));
    if (!paidAt) return setError(t("portal_paid_date_required"));
    if (!file) return setError(t("portal_file_required"));
    if (file.size > MAX_FILE_BYTES) return setError(t("proof_file_too_large"));

    setSubmitting(true);
    try {
      await createPaymentProof({ bill_id: selected.id, amount: value, paid_at: paidAt, reference: reference.trim(), file });
      toast.show(t("portal_proof_submitted"), "success");
      onSubmitted();
    } catch (err) {
      setError(tOr(`proof_error_${err.code}`, err.message || t("proof_error_UNKNOWN")));
    } finally {
      setSubmitting(false);
    }
  }

  const footer = (
    <>
      <GhostButton onClick={onClose}>{t("cancel")}</GhostButton>
      <PrimaryButton type="submit" form="payment-proof-form" disabled={submitting || !selected}>
        <Icon name="send" className="text-[18px]" />
        {submitting ? t("portal_submitting") : t("portal_submit_for_verification")}
      </PrimaryButton>
    </>
  );

  return (
    <Sheet open onClose={onClose} icon="upload_file" title={t("submit_payment_proof")} subtitle={t("portal_proof_sheet_hint")} footer={footer}>
      {payable.length === 0 ? (
        <p className="py-6 text-center text-sm text-on-surface-variant">{t("portal_no_payable_bills")}</p>
      ) : (
        <form id="payment-proof-form" onSubmit={submit} className="flex flex-col gap-3.5">
          <Field label={t("billing_period")}>
            <Select
              name="bill"
              label={t("bill")}
              value={billId ?? ""}
              onChange={changeBill}
              options={payable.map((b) => ({
                value: String(b.id),
                label: `${b.billing_period} (${money(b.outstanding, locale)})`,
              }))}
            />
          </Field>
          <div className="grid grid-cols-2 gap-2.5">
            <Input
              name="amount"
              label={t("payment_amount")}
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0"
              value={amount}
              onChange={setAmount}
            />
            <Input
              name="paid_at"
              label={t("paid_at")}
              type="date"
              value={paidAt}
              onChange={setPaidAt}
            />
          </div>
          <Input
            name="reference"
            label={t("payment_reference")}
            maxLength={100}
            placeholder={t("portal_reference_placeholder")}
            value={reference}
            onChange={setReference}
          />
          <Field label={t("proof_image")}>
            <label className="flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed border-white/15 bg-[#1c1e2d]/60 p-4 hover:border-primary/40">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/20">
                <Icon name="cloud_upload" className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-on-surface">{file ? file.name : t("portal_choose_receipt")}</p>
                <p className="text-[11px] text-on-surface-variant">{t("proof_file_hint")}</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </Field>
          {error ? <p className="rounded-xl border border-rose-500/25 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">{error}</p> : null}
        </form>
      )}
    </Sheet>
  );
}
