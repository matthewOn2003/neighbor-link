"use client";

import { useLocale } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/ui";
import { Icon } from "@/components/ui/Icon";
import { SummaryCard } from "@/components/ui/DataTable";
import { RecordFallback } from "@/components/staff/common";
import { useRequest } from "@/hooks/useRequest";
import { money } from "@/components/payments/shared";

export default function DashboardPage() {
  const { t, locale } = useLocale();
  const { data, loading } = useRequest("/tenant-portal/me", {});

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <PageHeader title={t("tenant_dashboard")} description={t("tenant_dashboard_description")} />
        <RecordFallback loading={loading && !data} found={Boolean(data)}>
          {data ? (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryCard label={t("outstanding_balance")} value={money(data.outstanding_balance, locale)} icon="payments" />
                <SummaryCard label={t("monthly_rent")} value={money(data.monthly_rent, locale)} icon="receipt_long" />
                <SummaryCard label={t("property")} value={data.property_name || "-"} icon="domain" />
                <SummaryCard label={t("contract_status")} value={data.contract?.status || "-"} icon="description" />
              </div>
              <div className="panel p-6">
                <h2 className="mb-4 text-base font-semibold text-scene-content">{t("quick_actions")}</h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Link className="btn btn-outline justify-start" href="/billing">
                    <Icon name="receipt_long" className="text-lg" />
                    <span>{t("view_bills")}</span>
                  </Link>
                  <Link className="btn btn-outline justify-start" href="/payment-proofs/new">
                    <Icon name="upload_file" className="text-lg" />
                    <span>{t("submit_payment_proof")}</span>
                  </Link>
                  <Link className="btn btn-outline justify-start" href="/maintenance/new">
                    <Icon name="build" className="text-lg" />
                    <span>{t("new_maintenance_request")}</span>
                  </Link>
                </div>
              </div>
            </>
          ) : null}
        </RecordFallback>
      </div>
    </main>
  );
}
