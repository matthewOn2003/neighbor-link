"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useRequest } from "@/hooks/useRequest";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { useToast } from "@/components/ui";

const currentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const money = (value, locale) =>
  "RM " + Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function GenerateBillsPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const [period, setPeriod] = useState(currentPeriod);
  const [saving, setSaving] = useState(false);
  const { data, loading, error } = useRequest("/bill/active-contracts");
  const contracts = Array.isArray(data) ? data : [];

  async function generate() {
    setSaving(true);
    try {
      const result = await request("/bill/generate", { billing_period: period });
      const count = Number(result?.generated_count ?? 0);
      if (count > 0) {
        toast.success(t("bills_generated", { count }));
      } else {
        toast.info(t("no_new_bills_generated"));
      }
      router.push("/bills");
    } catch (err) {
      if (err?.code === "BILL_EXISTS") toast.error(t("bill_exists"));
      else if (err?.code === "INVALID_PERIOD") toast.error(t("invalid_billing_period"));
      else toast.error(t("bill_generate_failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="flex w-full flex-col">
      <div className="p-4 md:p-8 space-y-6">
        <section className="panel space-y-6">
          <header className="space-y-4">
            <Link href="/bills" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-dark hover:underline">
              <span aria-hidden="true">←</span>
              {t("back_to_bills")}
            </Link>
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-scene-content">{t("generate_monthly_bills")}</h1>
              <p className="text-sm font-normal text-subtle">{t("generate_bills_description")}</p>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="field">
              <label htmlFor="billing-period" className="field-label">{t("billing_period")} *</label>
              <input
                id="billing-period"
                type="month"
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
                className="input w-full"
                required
              />
            </div>
            <div className="rounded-xl bg-scene p-4">
              <p className="text-sm text-subtle">{t("active_contracts")}</p>
              <p className="mt-2 text-2xl font-semibold text-scene-content">{loading ? "—" : contracts.length}</p>
            </div>
          </div>

          {error ? <p role="alert" className="text-sm text-error">{error}</p> : null}
          {loading ? (
            <div className="flex min-h-48 items-center justify-center"><Spinner size="lg" /></div>
          ) : contracts.length === 0 ? (
            <div className="p-12 text-center text-sm text-subtle">{t("no_active_contracts_for_bill")}</div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-scene">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="bg-accent text-xs uppercase text-subtle">
                  <tr>
                    {["contract_number", "tenant", "property_and_unit", "monthly_rent", "billing_day"].map((key) => (
                      <th key={key} className="px-4 py-3 font-semibold">{t(key)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-scene">
                  {contracts.map((contract) => (
                    <tr key={contract.id} className="hover:bg-scene/50 transition-colors">
                      <td className="px-4 py-3 font-semibold whitespace-nowrap">
                        <Link href={"/contracts/" + contract.id} className="text-primary-dark hover:underline">
                          CT-{String(contract.id).padStart(5, "0")}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-scene-content">{contract.tenant_name}</td>
                      <td className="px-4 py-3">
                        <div>{contract.property_name || "—"}</div>
                        <div className="text-xs text-subtle">{contract.unit_code || "—"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap font-semibold">{money(contract.monthly_rent, locale)}</td>
                      <td className="px-4 py-3 whitespace-nowrap">{contract.billing_day ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 border-t border-scene pt-5">
            <Link href="/bills" className="btn btn-outline">{t("cancel")}</Link>
            <button
              type="button"
              onClick={generate}
              disabled={saving || loading || !period || contracts.length === 0}
              className="btn btn-primary disabled:opacity-40"
            >
              <Icon name="autorenew" className="text-lg" />
              <span>{saving ? t("generating_bills") : t("confirm_generate_bills")}</span>
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
