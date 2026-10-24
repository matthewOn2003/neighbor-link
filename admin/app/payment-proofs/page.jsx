"use client";

import { useState } from "react";
import { ConfirmDialog, DataTable, Input, Select, Textarea, useToast, DatePicker, Icon, Modal, Spinner, StatusBadge } from "@/components/ui";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useDropdown } from "@/hooks/useDropdown";
import { useLocale } from "@/i18n";
import { request } from "@/services/request";
import { fdl } from "@/utils/date";
import { labelFor, money, usePropertyOptions, useUnitOptions } from "@/components/payments/shared";
import { apiErrorMessage } from "@/utils/errors";
import { indexBy } from "@/utils/collections";
import { api } from "@/services/api";

function ProofDetail({ row, statusItems }) {
  const { t, locale } = useLocale();
  const items = [
    [t("tenant_name"), row.tenant_name],
    [t("property_and_unit"), [row.property_name, row.unit_code].filter(Boolean).join(" · ") || "-"],
    [t("billing_period"), row.bill_period],
    [t("payment_amount"), money(row.amount, locale)],
    [t("paid_at"), fdl(row.paid_at) || "-"],
    [t("payment_reference"), row.reference || "-"],
    [t("status"), <StatusBadge key="status" value={row.status} options={statusItems} />],
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
  const statusMap = indexBy(statusItems);
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
  const [submitting, setSubmitting] = useState(false);

  const update = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));

  async function review(action, body) {
    const current = dialog;
    setSubmitting(true);
    try {
      await request(api.paymentProof.review(action, current.row.id), body);
      toast.success(t(action === "approve" ? "payment_proof_approved" : "payment_proof_rejected"));
    } catch (err) {
      toast.error(
        apiErrorMessage(err, t, {
          fallbackKey: "payment_proof_action_failed",
          codes: { INVALID_STATE: "proof_already_reviewed" },
        })
      );
    } finally {
      setSubmitting(false);
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
        api={api.paymentProof.list}
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
        title={t("payment_proofs")}
        description={t("payment_proofs_description")}
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
                  <StatusBadge value={row.status} options={statusItems} />
                </td>
                <td className="whitespace-nowrap text-subtle">{fdl(row.reviewed_at) || "-"}</td>
                <td>
                  <div className="flex justify-center items-center gap-2">
                    <button
                      type="button"
                      className="btn btn-primary btn-icon"
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
        {dialog?.mode === "view" ? <ProofDetail row={dialog.row} statusItems={statusItems} /> : null}
      </Modal>

      <ConfirmDialog
        open={dialog?.mode === "approve"}
        title={t("approve_payment_proof")}
        message={t("confirm_approve_payment_proof")}
        confirmLabel={t("approve")}
        loading={submitting}
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
            <button type="button" className="btn btn-outline" onClick={() => setDialog({ ...dialog, mode: "view" })} disabled={submitting}>
              {t("cancel")}
            </button>
            <button type="button" className="btn btn-danger" onClick={submitReject} disabled={submitting}>
              {submitting ? <Spinner size="sm" label={t("saving")} /> : t("reject")}
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

export default function PaymentProofsPage() {
  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <ProofReviewTab />
      </div>
    </main>
  );
}
