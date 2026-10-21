"use client";

import { use } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { RecordFallback } from "@/components/staff/common";
import { useDropdown } from "@/hooks/useDropdown";
import { useRequest } from "@/hooks/useRequest";
import { fdl } from "@/utils/date";

function Pill({ item, fallback }) {
  return <span className={`status-pill ${item?.variant || "neutral"}`}>{item?.label ?? fallback}</span>;
}

export default function MaintenanceDetailPage({ params }) {
  const { id } = use(params);
  const { t } = useLocale();
  const { data, loading } = useRequest(`/tenant-portal/maintenance/detail/${id}`, {});
  const { optionsOf } = useDropdown(["maintenance_category", "maintenance_priority", "maintenance_status"]);
  const categoryMap = Object.fromEntries(optionsOf("maintenance_category").map((item) => [item.value, item]));
  const priorityMap = Object.fromEntries(optionsOf("maintenance_priority").map((item) => [item.value, item]));
  const statusMap = Object.fromEntries(optionsOf("maintenance_status").map((item) => [item.value, item]));

  return (
    <RecordFallback loading={loading && !data} found={Boolean(data)}>
      {data ? (
        <main className="flex flex-col w-full">
          <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between gap-4">
              <Link className="text-sm font-semibold text-subtle hover:text-primary-dark" href="/maintenance">
                {t("maintenance_requests")}
              </Link>
            </div>
            <section className="panel p-6 space-y-6">
              <header className="space-y-2">
                <h1 className="text-2xl font-bold text-scene-content">{data.title}</h1>
                <div className="flex flex-wrap gap-2">
                  <Pill item={statusMap[data.status]} fallback={data.status} />
                  <Pill item={priorityMap[data.priority]} fallback={data.priority} />
                </div>
              </header>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-subtle">{t("category")}</dt>
                  <dd className="text-scene-content">{categoryMap[data.category]?.label ?? data.category}</dd>
                </div>
                <div>
                  <dt className="text-subtle">{t("assignee")}</dt>
                  <dd className="text-scene-content">{data.assignee || "-"}</dd>
                </div>
                <div>
                  <dt className="text-subtle">{t("created_at")}</dt>
                  <dd className="text-scene-content">{fdl(data.created_at)}</dd>
                </div>
                <div>
                  <dt className="text-subtle">{t("updated_at")}</dt>
                  <dd className="text-scene-content">{fdl(data.updated_at)}</dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-subtle">{t("description")}</dt>
                  <dd className="text-scene-content whitespace-pre-line">{data.description || "-"}</dd>
                </div>
                {data.resolution_notes ? (
                  <div className="md:col-span-2">
                    <dt className="text-subtle">{t("resolution_notes")}</dt>
                    <dd className="text-scene-content whitespace-pre-line">{data.resolution_notes}</dd>
                  </div>
                ) : null}
              </dl>
            </section>
          </div>
        </main>
      ) : null}
    </RecordFallback>
  );
}
