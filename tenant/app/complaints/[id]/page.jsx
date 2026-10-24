"use client";

import { use } from "react";
import { api } from "@/services/api";
import { useLocale } from "@/i18n";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useDictLabel, COMPLAINT_ICON } from "@/components/portal/status";
import { formatDateTime } from "@/components/portal/format";
import RequestDetail from "@/components/portal/RequestDetail";

export default function ComplaintDetailPage({ params }) {
  const { id } = use(params);
  const { t, locale } = useLocale();
  const { data, loading } = useApiRequest(api.complaint.detail, { id: Number(id) });
  const label = useDictLabel(["complaint_category"]);

  return (
    <RequestDetail
      loading={loading}
      item={data}
      icon={COMPLAINT_ICON[data?.category] ?? "report"}
      backHref="/services"
      backLabel={t("portal_back_to_services")}
      rows={[
        [t("category"), data ? label("complaint_category", data.category) : ""],
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
