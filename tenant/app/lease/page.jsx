"use client";

import { useLocale } from "@/i18n";
import { PageHeader } from "@/components/ui";
import { RecordFallback } from "@/components/staff/common";
import { useRequest } from "@/hooks/useRequest";
import { fdl } from "@/utils/date";
import { money } from "@/components/payments/shared";

export default function LeasePage() {
  const { t, locale } = useLocale();
  const { data, loading } = useRequest("/tenant-portal/me", {});
  const contract = data?.contract;

  const items = contract
    ? [
        [t("property"), data.property_name || "-"],
        [t("lease_start"), fdl(contract.start_date) || "-"],
        [t("lease_end"), fdl(contract.end_date) || "-"],
        [t("monthly_rent"), money(contract.monthly_rent, locale)],
        [t("security_deposit"), money(contract.security_deposit, locale)],
        [t("billing_day"), contract.billing_day ?? "-"],
        [t("contract_status"), contract.status || "-"],
      ]
    : [];

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <PageHeader title={t("menu_lease")} description={t("lease_description")} />
        <RecordFallback loading={loading && !data} found={Boolean(data)}>
          {contract ? (
            <div className="panel p-6">
              <dl className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                {items.map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-scene p-4">
                    <dt className="text-xs font-semibold text-subtle">{label}</dt>
                    <dd className="mt-2 text-sm font-semibold text-scene-content">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ) : (
            <p className="p-12 text-center text-sm text-subtle">{t("no_active_contract")}</p>
          )}
        </RecordFallback>
      </div>
    </main>
  );
}
