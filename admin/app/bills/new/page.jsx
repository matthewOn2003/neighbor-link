"use client";

import { useMemo, useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useApiRequest } from "@/hooks/useApiRequest";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { Input, Textarea, useToast, Select } from "@/components/ui";
import { contractRef } from "@/utils/documents";
import { apiErrorMessage } from "@/utils/errors";
import { todayISO } from "@/utils/date";
import { api } from "@/services/api";

export default function NewBillPage() {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();

  const today = todayISO();
  const [period, setPeriod] = useState(today.slice(0, 7));
  const [contractID, setContractID] = useState("");
  const [dueDate, setDueDate] = useState(today);
  const [lateFee, setLateFee] = useState("0");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const { data: contractsData, loading } = useApiRequest(api.bill.activeContracts, {});
  const contracts = Array.isArray(contractsData) ? contractsData : [];
  const selected = useMemo(
    () => contracts.find((c) => String(c.id) === contractID),
    [contracts, contractID]
  );

  const contractOptions = [
    { value: "", label: loading ? t("loading") : t("select_active_contract") },
    ...contracts.map((c) => ({
      value: String(c.id),
      label: `${contractRef(c.id)} · ${c.tenant_name} · ${c.property_name || "—"} / ${c.unit_code || "—"} · RM ${Number(c.monthly_rent).toFixed(2)}`,
    })),
  ]

  function changeContract(id) {
    setContractID(id);
    const c = contracts.find((x) => String(x.id) === id);
    if (c) {
      const day = String(c.billing_day || 1).padStart(2, "0");
      setDueDate(period + "-" + day);
    }
  }

  function changePeriod(value) {
    setPeriod(value);
    if (selected) {
      setDueDate(value + "-" + String(selected.billing_day || 1).padStart(2, "0"));
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!selected) return;

    setSubmitting(true);
    try {
      const b = await request(api.bill.create, {
        contract_id: Number(contractID),
        billing_period: period,
        due_date: dueDate,
        amount: Number(selected.monthly_rent),
        late_fee: Number(lateFee || 0),
        notes: notes.trim(),
      });
      toast.success(t("bill_created"));
      router.push("/bills/" + b.id);
    } catch (e) {
      toast.error(
        apiErrorMessage(e, t, {
          fallbackKey: "bill_create_failed",
          codes: { BILL_EXISTS: "bill_exists" },
          serverMessage: false,
        })
      );
    } finally {
      setSubmitting(false);
    }
  }

  const field = "field";
  const label = "field-label";

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">
      <header>
        <Link href="/bills" className="text-sm text-primary-dark">
          ← {t("back_to_bills")}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">{t("create_bill")}</h1>
        <p className="mt-1 text-sm text-subtle">{t("create_bill_description")}</p>
      </header>

      <form onSubmit={submit} className="space-y-6 rounded-xl bg-accent p-6 shadow">
        <div className={field}>
          <label htmlFor="contract" className={label}>
            {t("active_contract")} *
          </label>
          <Select
            name="contract"
            label={t("contract")}
            value={contractID}
            onChange={changeContract}
            required
            disabled={loading}
            placeholder={loading ? t("loading") : t("select_active_contract")}
            options={contractOptions}
          />
          {!loading && !contracts.length ? (
            <p className="mt-1 text-xs text-subtle">{t("no_active_contracts_for_bill")}</p>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Input
            name="period"
            label={t("billing_period")}
            type="month"
            value={period}
            onChange={changePeriod}
            required
          />

          <Input
            name="due"
            label={t("due_date")}
            type="date"
            value={dueDate}
            onChange={setDueDate}
            required
          />

          <Input
            name="amount"
            label={t("bill_amount")}
            value={selected ? "RM " + Number(selected.monthly_rent).toFixed(2) : "—"}
            onChange={() => { }}
            readOnly
          />

          <Input
            name="fee"
            label={t("late_fee")}
            type="number"
            value={lateFee}
            onChange={setLateFee}
            min="0"
            step="0.01"
          />
        </div>

        <Textarea
          name="notes"
          label={t("notes")}
          rows={3}
          value={notes}
          onChange={setNotes}
        />

        <div className="flex justify-end gap-3">
          <Link href="/bills" className="btn btn-outline">
            {t("cancel")}
          </Link>
          <button type="submit" disabled={submitting || !selected} className="btn btn-primary">
            {submitting ? t("saving") : t("create_bill")}
          </button>
        </div>
      </form>
    </main>
  );
}