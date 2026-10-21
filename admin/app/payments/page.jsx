"use client";

import { useState } from "react";
import { ConfirmDialog, DataTable, FormSection, Input, Select, Tabs, Textarea, useToast } from "@/components/ui";
import { DatePicker } from "@/components/ui/DatePicker";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import { PdfPreviewModal } from "@/components/ui/PdfPreviewModal";
import { Spinner } from "@/components/ui/Spinner";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useDropdown } from "@/hooks/useDropdown";
import { useRequest } from "@/hooks/useRequest";
import { useLocale } from "@/i18n";
import { request } from "@/services/request";
import { fdl } from "@/utils/date";
import { buildSimplePdf } from "@/utils/pdf";

const money = (value, locale) =>
  `RM ${Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const receiptNumber = (id) => `RCPT-${String(id).padStart(6, "0")}`;

const METHOD_KEYS = {
  bank_transfer: "payment_bank_transfer",
  cash: "payment_cash",
  online: "payment_online",
  other: "payment_other",
};

function methodLabel(t, method) {
  if (!method) return "-";
  return METHOD_KEYS[method] ? t(METHOD_KEYS[method]) : method;
}

const labelFor = (options, value) => options.find((option) => option.value === value)?.label ?? value;

const isDay = (value) => Number.isInteger(value) && value >= 1 && value <= 28;

// 后端 proof 与 payment 列表的筛选参数：物业 property_id、单元 unit_id（字符串）
function usePropertyOptions() {
  const { t } = useLocale();
  const { data } = useRequest("/property/list", { per_page: 100 });
  return [
    { value: "", label: t("all_properties") },
    ...(data?.list ?? []).map((property) => ({ value: String(property.id), label: property.name })),
  ];
}

// 未选物业时不展示单元，选定物业后才列出该物业的单元
function useUnitOptions(propertyId) {
  const { t } = useLocale();
  const { data } = useRequest("/property/unit/list", { property_id: propertyId, per_page: 100 });
  const units = propertyId ? (data?.list ?? []) : [];
  return [
    { value: "", label: t("all_units") },
    ...units.map((unit) => ({ value: String(unit.id), label: unit.code })),
  ];
}

function reviewErrorMessage(err, t) {
  if (err?.code === "INVALID_STATE") return t("proof_already_reviewed");
  return err?.message || t("payment_proof_action_failed");
}

function buildReceipt(row, t, locale) {
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

function ProofDetail({ row, status }) {
  const { t, locale } = useLocale();
  const items = [
    [t("tenant_name"), row.tenant_name],
    [t("property_and_unit"), [row.property_name, row.unit_code].filter(Boolean).join(" · ") || "-"],
    [t("billing_period"), row.bill_period],
    [t("payment_amount"), money(row.amount, locale)],
    [t("paid_at"), fdl(row.paid_at) || "-"],
    [t("payment_reference"), row.reference || "-"],
    [t("status"), <span key="status" className={`status-pill ${status?.variant || "neutral"}`}>{status?.label ?? row.status}</span>],
    [t("reviewed_at"), fdl(row.reviewed_at) || "-"],
    [t("reviewed_by"), row.reviewed_by || "-"],
  ];
  if (row.reject_reason) items.push([t("reject_reason"), row.reject_reason]);

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="rounded-lg bg-scene p-3">
            <dt className="text-xs font-semibold text-subtle">{label}</dt>
            <dd className="mt-1 text-sm text-scene-content">{value}</dd>
          </div>
        ))}
      </dl>
      {row.file_url ? (
        <img
          src={row.file_url}
          alt={t("payment_proof")}
          className="max-h-[60vh] w-full rounded-lg border border-line/40 object-contain"
        />
      ) : (
        <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-line/60 text-sm text-subtle">
          {t("no_proof_file")}
        </div>
      )}
    </div>
  );
}

function ProofReviewTab() {
  const { t, locale } = useLocale();
  const toast = useToast();
  const { optionsOf } = useDropdown(["payment_proof_status"]);
  const statusItems = optionsOf("payment_proof_status");
  const statusMap = Object.fromEntries(statusItems.map((item) => [item.value, item]));
  const statusOptions = [{ value: "", label: t("all_statuses") }, ...statusItems];
  const propertyOptions = usePropertyOptions();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({
    keyword: "",
    status: "",
    property_id: "",
    unit_id: "",
    paid_from: "",
    paid_to: "",
    amount_min: "",
    amount_max: "",
  });
  const unitOptions = useUnitOptions(draft.property_id);
  // dialog: { mode: "view" | "approve" | "reject", row, reload }
  const [dialog, setDialog] = useState(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));

  async function review(action, body) {
    const current = dialog;
    setBusy(true);
    try {
      await request(`/payment-proof/${action}/${current.row.id}`, body);
      toast.success(t(action === "approve" ? "payment_proof_approved" : "payment_proof_rejected"));
    } catch (err) {
      toast.error(reviewErrorMessage(err, t));
    } finally {
      setBusy(false);
      current.reload();
      setDialog(null);
    }
  }

  function submitReject() {
    const trimmed = reason.trim();
    if (!trimmed) {
      setReasonError(t("field_required"));
      return;
    }
    review("reject", { reason: trimmed });
  }

  return (
    <>
      <DataTable
        api="/payment-proof/list"
        params={applied}
        filterValues={draft}
        filterBadges={[
          { key: "keyword", label: t("search_keyword") },
          { key: "status", label: t("status"), display: (value) => labelFor(statusOptions, value) },
          { key: "property_id", label: t("property"), display: (value) => labelFor(propertyOptions, value) },
          { key: "unit_id", label: t("unit"), display: (value) => labelFor(unitOptions, value) },
          { key: "paid_from", label: t("paid_from") },
          { key: "paid_to", label: t("paid_to") },
          { key: "amount_min", label: t("amount_min") },
          { key: "amount_max", label: t("amount_max") },
        ]}
        onClearFilter={clear}
        exportConfig={{
          filename: "payment-proofs",
          columns: [
            { label: t("tenant_name"), get: (r) => r.tenant_name },
            { label: t("property"), get: (r) => r.property_name },
            { label: t("unit"), get: (r) => r.unit_code },
            { label: t("billing_period"), get: (r) => r.bill_period },
            { label: t("payment_amount"), get: (r) => r.amount },
            { label: t("paid_at"), get: (r) => fdl(r.paid_at) },
            { label: t("payment_reference"), get: (r) => r.reference },
            { label: t("status"), get: (r) => statusMap[r.status]?.label ?? r.status },
            { label: t("reviewed_at"), get: (r) => fdl(r.reviewed_at) },
          ],
        }}
        title={t("payments")}
        description={t("payments_description")}
        emptyText={t("no_payment_proofs")}
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
            <Select variant="filter" name="status" label={t("status")} value={draft.status} onChange={update("status")} options={statusOptions} />
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
        header={() => (
          <tr className="bg-accent text-subtle font-semibold">
            <th>{t("tenant_name")}</th>
            <th>{t("property_and_unit")}</th>
            <th>{t("billing_period")}</th>
            <th>{t("payment_amount")}</th>
            <th>{t("paid_at")}</th>
            <th>{t("payment_reference")}</th>
            <th>{t("status")}</th>
            <th>{t("reviewed_at")}</th>
            <th>{t("action")}</th>
          </tr>
        )}
        body={({ rows, reload }) =>
          rows.map((row) => {
            const status = statusMap[row.status];
            return (
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
                <td className="whitespace-nowrap text-subtle">{fdl(row.paid_at)}</td>
                <td className="text-subtle">{row.reference || "-"}</td>
                <td>
                  <span className={`status-pill ${status?.variant || "neutral"}`}>{status?.label ?? row.status}</span>
                </td>
                <td className="whitespace-nowrap text-subtle">{fdl(row.reviewed_at) || "-"}</td>
                <td>
                  <div className="flex justify-center items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-primary !p-0 size-10 grid place-items-center"
                      aria-label={t("view_details")}
                      onClick={() => setDialog({ mode: "view", row, reload })}
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

      <Modal
        open={dialog?.mode === "view"}
        onClose={() => setDialog(null)}
        title={t("review_payment_proof")}
        size="lg"
        footer={(
          <>
            <button type="button" className="btn btn-outline" onClick={() => setDialog(null)}>{t("close")}</button>
            {dialog?.row.status === "pending" ? (
              <>
                <button
                  type="button"
                  className="btn btn-outline text-error"
                  onClick={() => {
                    setReason("");
                    setReasonError("");
                    setDialog({ ...dialog, mode: "reject" });
                  }}
                >
                  {t("reject")}
                </button>
                <button type="button" className="btn btn-primary" onClick={() => setDialog({ ...dialog, mode: "approve" })}>
                  {t("approve")}
                </button>
              </>
            ) : null}
          </>
        )}
      >
        {dialog?.mode === "view" ? <ProofDetail row={dialog.row} status={statusMap[dialog.row.status]} /> : null}
      </Modal>

      <ConfirmDialog
        open={dialog?.mode === "approve"}
        title={t("approve_payment_proof")}
        message={t("confirm_approve_payment_proof")}
        confirmLabel={t("approve")}
        loading={busy}
        onConfirm={() => review("approve", {})}
        onCancel={() => setDialog({ ...dialog, mode: "view" })}
      />

      <Modal
        open={dialog?.mode === "reject"}
        onClose={() => setDialog({ ...dialog, mode: "view" })}
        title={t("reject_payment_proof")}
        size="md"
        footer={(
          <>
            <button type="button" className="btn btn-outline" onClick={() => setDialog({ ...dialog, mode: "view" })} disabled={busy}>
              {t("cancel")}
            </button>
            <button type="button" className="btn btn-danger" onClick={submitReject} disabled={busy}>
              {busy ? <Spinner size="sm" label={t("saving")} /> : t("reject")}
            </button>
          </>
        )}
      >
        <Textarea
          label={t("reject_reason")}
          name="reject_reason"
          value={reason}
          required
          rows={3}
          error={reasonError}
          onChange={(value) => {
            setReason(value);
            setReasonError("");
          }}
        />
      </Modal>
    </>
  );
}

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

function BillingSettingsForm({ initial, onSaved }) {
  const { t } = useLocale();
  const toast = useToast();
  const [form, setForm] = useState(() => ({
    due_day: String(initial.due_day ?? ""),
    overdue_day: String(initial.overdue_day ?? ""),
    bank_name: initial.bank_name ?? "",
    bank_account_no: initial.bank_account_no ?? "",
    bank_account_holder: initial.bank_account_holder ?? "",
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const dueDay = Number(form.due_day);
    const overdueDay = Number(form.overdue_day);
    const nextErrors = {};
    if (!isDay(dueDay)) nextErrors.due_day = t("day_range_error");
    if (!isDay(overdueDay)) {
      nextErrors.overdue_day = t("day_range_error");
    } else if (isDay(dueDay) && overdueDay <= dueDay) {
      nextErrors.overdue_day = t("overdue_day_after_due_day");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await request("/billing-settings/update", {
        due_day: dueDay,
        overdue_day: overdueDay,
        bank_name: form.bank_name.trim(),
        bank_account_no: form.bank_account_no.trim(),
        bank_account_holder: form.bank_account_holder.trim(),
      });
      toast.success(t("billing_settings_saved"));
      onSaved();
    } catch (err) {
      toast.error(err?.message || t("save_failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <FormSection title={t("billing_schedule")} description={t("billing_schedule_description")}>
        <Input
          label={t("due_day")}
          name="due_day"
          type="number"
          value={form.due_day}
          required
          error={errors.due_day}
          onChange={(value) => updateField("due_day", value)}
        />
        <Input
          label={t("overdue_day")}
          name="overdue_day"
          type="number"
          value={form.overdue_day}
          required
          error={errors.overdue_day}
          onChange={(value) => updateField("overdue_day", value)}
        />
      </FormSection>

      <FormSection title={t("bank_account")} description={t("bank_account_description")}>
        <Input label={t("bank_name")} name="bank_name" value={form.bank_name} onChange={(value) => updateField("bank_name", value)} />
        <Input label={t("bank_account_no")} name="bank_account_no" value={form.bank_account_no} onChange={(value) => updateField("bank_account_no", value)} />
        <Input label={t("bank_account_holder")} name="bank_account_holder" value={form.bank_account_holder} onChange={(value) => updateField("bank_account_holder", value)} />
      </FormSection>

      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("save_changes")}
        </button>
      </div>
    </form>
  );
}

function CollectionSettingsTab() {
  const { t } = useLocale();
  const { data, loading, reload } = useRequest("/billing-settings/detail", {});

  return (
    <section className="panel">
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold text-scene-content">{t("payments")}</h1>
        <p className="text-sm font-normal text-subtle">{t("payments_description")}</p>
      </div>
      <div className="mt-6">
        {loading && !data ? (
          <div className="flex min-h-48 items-center justify-center">
            <Spinner size="lg" />
          </div>
        ) : !data ? (
          <p className="text-sm text-error">{t("load_failed")}</p>
        ) : (
          <BillingSettingsForm initial={data} onSaved={reload} />
        )}
      </div>
    </section>
  );
}

export default function PaymentsPage() {
  const { t } = useLocale();

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <Tabs
          defaultTab="review"
          tabs={[
            { key: "review", label: t("payment_tab_review"), content: <ProofReviewTab /> },
            { key: "receipts", label: t("payment_tab_receipts"), content: <ReceiptsTab /> },
            { key: "settings", label: t("payment_tab_settings"), content: <CollectionSettingsTab /> },
          ]}
        />
      </div>
    </main>
  );
}
