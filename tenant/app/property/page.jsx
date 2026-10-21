"use client";

import { useLocale } from "@/i18n";
import { PageHeader } from "@/components/ui";
import { RecordFallback } from "@/components/staff/common";
import { useRequest } from "@/hooks/useRequest";

export default function PropertyPage() {
  const { t } = useLocale();
  const { data, loading } = useRequest("/tenant-portal/wifi", {});

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <PageHeader title={t("menu_property")} description={t("property_description")} />
        <RecordFallback loading={loading && !data} found={Boolean(data)}>
          {data ? (
            <div className="panel p-6">
              <dl className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <div className="rounded-lg bg-scene p-4">
                  <dt className="text-xs font-semibold text-subtle">{t("property")}</dt>
                  <dd className="mt-2 text-sm font-semibold text-scene-content">{data.property_name || "-"}</dd>
                </div>
                <div className="rounded-lg bg-scene p-4">
                  <dt className="text-xs font-semibold text-subtle">{t("wifi_ssid")}</dt>
                  <dd className="mt-2 text-sm font-semibold text-scene-content">{data.wifi_ssid || "-"}</dd>
                </div>
                <div className="rounded-lg bg-scene p-4">
                  <dt className="text-xs font-semibold text-subtle">{t("wifi_password")}</dt>
                  <dd className="mt-2 text-sm font-semibold text-scene-content">{data.wifi_password || "-"}</dd>
                </div>
              </dl>
            </div>
          ) : null}
        </RecordFallback>
      </div>
    </main>
  );
}
