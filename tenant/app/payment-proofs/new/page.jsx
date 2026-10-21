"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { FormPage, FormSection, Input, Select, useToast } from "@/components/ui";
import { DatePicker } from "@/components/ui/DatePicker";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Spinner } from "@/components/ui/Spinner";
import { useRequest } from "@/hooks/useRequest";
import { createPaymentProof } from "@/services/tenant-portal/paymentProof";
import { money } from "@/components/payments/shared";

const PAYABLE_EXCLUDED = ["paid", "void"];
const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function NewPaymentProofPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const { data: billData } = useRequest("/tenant-portal/bills", { current_page: 1, per_page: 100 });
  const billOptions = (billData?.list ?? [])
    .filter((bill) => !PAYABLE_EXCLUDED.includes(bill.display_status))
    .map((bill) => ({
      value: String(bill.id),
      label: `${bill.billing_period} · ${money(bill.outstanding, locale)}`,
    }));

  const [form, setForm] = useState({ bill_id: "", amount: "", paid_at: "", reference: "" });
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.bill_id) nextErrors.bill_id = t("field_required");
    if (!(Number(form.amount) > 0)) nextErrors.amount = t("amount_must_be_positive");
    if (!form.paid_at) nextErrors.paid_at = t("field_required");
    if (!file) nextErrors.file = t("field_required");
    else if (file.size > MAX_FILE_SIZE) nextErrors.file = t("proof_file_too_large");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await createPaymentProof({
        bill_id: form.bill_id,
        amount: form.amount,
        paid_at: form.paid_at,
        reference: form.reference.trim(),
        file,
      });
      toast.success(t("record_saved"));
      router.push("/payment-proofs");
    } catch (err) {
      toast.error(err?.code ? t(`proof_error_${err.code}`) : err?.message || t("save_failed"));
      setSaving(false);
    }
  }

  return (
    <FormPage
      title={t("submit_payment_proof")}
      subtitle={t("submit_payment_proof_description")}
      backLabel={t("menu_payment_proofs")}
      backHref="/payment-proofs"
      onSubmit={handleSubmit}
      size="md"
      actions={(
        <div className="flex gap-3">
          <button type="button" className="btn btn-outline" onClick={() => router.push("/payment-proofs")} disabled={saving}>
            {t("cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("submit_payment_proof")}
          </button>
        </div>
      )}
    >
      <FormSection title={t("details")}>
        <Select
          label={t("bill")}
          name="bill_id"
          required
          value={form.bill_id}
          error={errors.bill_id}
          placeholder={t("select_placeholder")}
          options={billOptions}
          onChange={(v) => updateField("bill_id", v)}
        />
        <Input
          label={t("payment_amount")}
          name="amount"
          type="number"
          required
          value={form.amount}
          error={errors.amount}
          onChange={(v) => updateField("amount", v)}
        />
        <DatePicker
          label={t("paid_at")}
          name="paid_at"
          required
          value={form.paid_at}
          error={errors.paid_at}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(v) => updateField("paid_at", v)}
        />
        <Input label={t("payment_reference")} name="reference" value={form.reference} onChange={(v) => updateField("reference", v)} />
      </FormSection>

      <FormSection title={t("proof_image")}>
        <div className="space-y-2">
          <FileDropzone
            accept={ACCEPT}
            fileName={file?.name}
            hint={t("proof_file_hint")}
            onFile={(selected) => {
              setFile(selected);
              setErrors((current) => ({ ...current, file: undefined }));
            }}
          />
          {errors.file ? <p className="text-xs text-error">{errors.file}</p> : null}
        </div>
      </FormSection>
    </FormPage>
  );
}
