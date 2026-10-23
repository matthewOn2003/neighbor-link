"use client";

import { useState } from "react";
import { FormSection, Input, useToast } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useApiRequest } from "@/hooks/useApiRequest";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { request } from "@/services/request";

const isDay = (value) => Number.isInteger(value) && value >= 1 && value <= 28;

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

export default function CollectionSettingsPage() {
  const { t } = useLocale();
  const { data, loading, reload } = useApiRequest("/billing-settings/detail", {});

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold text-scene-content">{t("collection_settings")}</h1>
            <p className="text-sm font-normal text-subtle">{t("collection_settings_description")}</p>
          </div>
          <Link className="btn btn-outline" href="/payments">
            <Icon name="arrow_back" className="text-lg" />
            <span>{t("back_to_payments")}</span>
          </Link>
        </div>
        <section className="panel">
          {loading && !data ? (
            <div className="flex min-h-48 items-center justify-center">
              <Spinner size="lg" />
            </div>
          ) : !data ? (
            <p className="text-sm text-error">{t("load_failed")}</p>
          ) : (
            <BillingSettingsForm initial={data} onSaved={reload} />
          )}
        </section>
      </div>
    </main>
  );
}
