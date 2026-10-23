"use client";

import { use } from "react";
import { useLocale } from "@/i18n";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useDictLabel, MAINTENANCE_ICON } from "@/components/portal/status";
import { formatDateTime } from "@/components/portal/format";
import RequestDetail from "@/components/portal/RequestDetail";

export default function MaintenanceDetailPage({ params }) {
  const { id } = use(params);
  const { t, locale } = useLocale();
  const { data, loading } = useApiRequest(`/tenant-portal/maintenance/detail/${id}`, {});
  const label = useDictLabel(["maintenance_category", "maintenance_priority"]);

  return (
    <RequestDetail
      loading={loading}
      item={data}
      icon={MAINTENANCE_ICON[data?.category] ?? "build"}
      backHref="/services"
      backLabel={t("portal_back_to_services")}
      optionLabelOf={(slug, value) => label(slug, value)}
      rows={[
        [t("category"), data ? label("maintenance_category", data.category) : ""],
        [t("priority"), data ? label("maintenance_priority", data.priority) : ""],
        [t("portal_work_order"), data ? `M-${data.id}` : ""],
        [t("unit"), data?.unit_code],
        [t("assignee"), data?.assignee || t("portal_unassigned")],
        [t("created_at"), data ? formatDateTime(data.created_at, locale) : ""],
        [t("resolved_at"), data?.resolved_at ? formatDateTime(data.resolved_at, locale) : ""],
      ]}
      description={data?.description}
      resolution={data?.resolution_notes}
    />
  );
}
