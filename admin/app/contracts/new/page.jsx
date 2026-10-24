"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useDropdown } from "@/hooks/useDropdown";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { Input, Select, Textarea, useToast } from "@/components/ui";
import { apiErrorMessage } from "@/utils/errors";
import { todayISO } from "@/utils/date";
import { api } from "@/services/api";

const termFields = [
  ["start_date", "date", true],
  ["end_date", "date", true],
  ["monthly_rent", "number", true],
  ["security_deposit", "number", false],
  ["billing_day", "number", true],
];

const labelKeys = {
  start_date: "contract_start",
  end_date: "contract_end",
  monthly_rent: "monthly_rent",
  security_deposit: "security_deposit",
  billing_day: "billing_day",
};

export default function NewContractPage() {
  const { t } = useLocale();
  const { optionsOf } = useDropdown(["contract_status"]);
  const contractStatusOptions = optionsOf("contract_status");
  const router = useRouter();
  const toast = useToast();

  const [f, S] = useState({
    tenant_id: "",
    start_date: todayISO(),
    end_date: "",
    monthly_rent: "",
    security_deposit: "0",
    billing_day: "1",
    status: "draft",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, se] = useState({});

  const { data, loading } = useApiRequest(api.tenant.list, {
    current_page: 1,
    per_page: 100,
    status: "active",
  });
  const tenants = data?.list ?? [];

  const set = (k, v) => {
    S((o) => ({ ...o, [k]: v }));
    se((o) => ({ ...o, [k]: "" }));
  };

  async function submit(e) {
    e.preventDefault();

    const er = {};
    if (!f.tenant_id) er.tenant_id = t("field_required");
    if (!f.end_date || f.end_date <= f.start_date) er.end_date = t("contract_end_after_start");
    if (f.monthly_rent === "" || Number(f.monthly_rent) < 0) er.monthly_rent = t("field_required");
    se(er);
    if (Object.keys(er).length) return;

    setSubmitting(true);
    try {
      const r = await request(api.contract.create, {
        tenant_id: Number(f.tenant_id),
        start_date: f.start_date,
        end_date: f.end_date,
        monthly_rent: Number(f.monthly_rent),
        security_deposit: Number(f.security_deposit || 0),
        billing_day: Number(f.billing_day || 1),
        status: f.status,
        notes: f.notes.trim(),
      });
      toast.success(t("contract_created"));
      router.push("/contracts/" + r.id);
    } catch (e) {
      toast.error(
        apiErrorMessage(e, t, {
          fallbackKey: "contract_save_failed",
          codes: { ACTIVE_CONTRACT_EXISTS: "contract_active_exists" },
          serverMessage: false,
        })
      );
    } finally {
      setSubmitting(false);
    }
  }

  const field = "field";
  const label = "field-label";
  const tenantOptions = [
    { value: "", label: loading ? t("loading") : t("select_tenant") },
    ...tenants.map((x) => ({
      value: String(x.id),
      label: `${x.name} · ${x.property_name || t("no_property_assigned")} · ${x.unit || "—"}`,
    })),
  ];

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-8">
      <header>
        <Link href="/contracts" className="text-sm text-primary-dark">
          ← {t("back_to_contracts")}
        </Link>
        <h1 className="mt-3 text-2xl font-semibold">{t("new_contract")}</h1>
        <p className="mt-1 text-sm text-subtle">{t("new_contract_description")}</p>
      </header>

      <form onSubmit={submit} className="space-y-6 rounded-xl bg-accent p-6 shadow">
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t("contract_parties")}</h2>
          <div className={field}>
            <label className={label} htmlFor="tenant_id">
              {t("tenant")} *
            </label>
            <Select
              name="tenant_id"
              label={t("tenant")}
              value={f.tenant_id}
              onChange={(v) => set("tenant_id", v)}
              required
              options={tenantOptions}
            />
            {errors.tenant_id ? <span className="field-error">{errors.tenant_id}</span> : null}
            {!loading && !tenants.length ? (
              <p className="text-xs text-subtle">{t("no_active_tenants_for_contract")}</p>
            ) : null}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t("contract_terms")}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {termFields.map(([k, type, required]) => (
              <div key={k} className={field}>
                <label className={label} htmlFor={k}>
                  {t(labelKeys[k])}
                  {required ? " *" : ""}
                  {k === "monthly_rent" || k === "security_deposit" ? " (RM)" : ""}
                </label>
                <Input
                  name={k}
                  label={t(labelKeys[k])}
                  type={type}
                  value={f[k]}
                  onChange={(v) => set(k, v)}
                  required={required}
                  min={k === "billing_day" ? 1 : 0}
                  max={k === "billing_day" ? 28 : undefined}
                  step={k === "monthly_rent" || k === "security_deposit" ? "0.01" : undefined}
                />
                {errors[k] ? <span className="field-error">{errors[k]}</span> : null}
                {k === "billing_day" ? (
                  <p className="text-xs text-subtle">{t("billing_day_hint")}</p>
                ) : null}
              </div>
            ))}

            <div className={field}>
              <label className={label} htmlFor="status">
                {t("status")}
              </label>
              <Select
                name="status"
                label={t("status")}
                value={f.status}
                onChange={(v) => set("status", v)}
                options={contractStatusOptions}
              />
            </div>
          </div>

          <Textarea
            name="notes"
            label={t("notes")}
            rows={4}
            value={f.notes}
            onChange={(v) => set("notes", v)}
            placeholder={t("contract_notes_placeholder")}
          />
        </section>

        <div className="flex justify-end gap-3">
          <Link href="/contracts" className="btn btn-outline">
            {t("cancel")}
          </Link>
          <button disabled={submitting} type="submit" className="btn btn-primary">
            {submitting ? t("saving") : t("save_contract")}
          </button>
        </div>
      </form>
    </main>
  );
}