"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { formatMoney } from "@/utils/format";
import { useToast } from "@/components/ui";

const currentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};


export default function GenerateBillsPage() {
  const { t, locale } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const [period, setPeriod] = useState(currentPeriod);
  const [saving, setSaving] = useState(false);

  async function generate() {
    setSaving(true);
    try {
      const result = await request("/bill/generate", { billing_period: period });
      const count = Number(result?.generated_count ?? 0);
      if (count > 0) {
        toast.success(t("bills_generated", { count }));
      } else {
        toast.success(t("no_new_bills_generated"));
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
        <DataTable
          api="/bill/active-contracts"
          title={t("generate_monthly_bills")}
          description={t("generate_bills_description")}
          buttons={(
            <>
              <Input
                name="billing_period"
                label={t("billing_period")}
                type="month"
                value={period}
                onChange={setPeriod}
                required
                className="min-w-[160px]"
              />
              <Link href="/bills" className="btn btn-outline">
                <span>{t("back_to_bills")}</span>
              </Link>
              <button
                type="button"
                onClick={generate}
                disabled={saving || !period}
                className="btn btn-primary disabled:opacity-40"
              >
                <Icon name="autorenew" className="text-lg" />
                <span>{saving ? t("generating_bills") : t("confirm_generate_bills")}</span>
              </button>
            </>
          )}
          summary={({ total }) => (
            <SummaryCard label={t("active_contracts")} value={total} icon="description" />
          )}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              {["contract_number", "tenant", "property_and_unit", "monthly_rent", "billing_day"].map((key) => (
                <th key={key}>{t(key)}</th>
              ))}
            </tr>
          )}
          body={({ rows }) =>
            rows.map((contract) => (
              <tr key={contract.id}>
                <td className="font-semibold whitespace-nowrap">
                  <Link href={"/contracts/" + contract.id} className="link-inline">
                    CT-{String(contract.id).padStart(5, "0")}
                  </Link>
                </td>
                <td className="text-scene-content">{contract.tenant_name}</td>
                <td>
                  <div>{contract.property_name || "—"}</div>
                  <div className="text-xs text-subtle">{contract.unit_code || "—"}</div>
                </td>
                <td className="whitespace-nowrap font-semibold">{formatMoney(contract.monthly_rent, locale)}</td>
                <td className="whitespace-nowrap">{contract.billing_day ?? "—"}</td>
              </tr>
            ))
          }
        />
      </div>
    </main>
  );
}

