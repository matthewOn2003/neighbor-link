"use client";

import { use, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { FormPage, FormSection, Input, Select, Textarea, useToast, Spinner, StatusBadge } from "@/components/ui";
import { RecordFallback } from "@/components/staff/common";
import { useDropdown } from "@/hooks/useDropdown";
import { useApiData } from "@/hooks/useApiData";
import { request } from "@/utils/request";
import { fdl } from "@/utils/date";
import { apiErrorMessage } from "@/utils/errors";
import { indexBy } from "@/utils/collections";

export default function MaintenanceDetailPage({ params }) {
  const { id } = use(params);
  const { data, loading, reload } = useApiData("/maintenance/detail", { id: Number(id) });

  return (
    <RecordFallback loading={loading && !data} found={Boolean(data)}>
      {data ? <MaintenanceDetailForm record={data} reload={reload} /> : null}
    </RecordFallback>
  );
}

function MaintenanceDetailForm({ record, reload }) {
  const { t } = useLocale();
  const toast = useToast();

  const { optionsOf } = useDropdown([
    "maintenance_category",
    "maintenance_priority",
    "maintenance_status",
  ]);
  const categoryItems = optionsOf("maintenance_category");
  const priorityItems = optionsOf("maintenance_priority");
  const statusItems = optionsOf("maintenance_status");

  const categoryMap = indexBy(categoryItems);

  const [form, setForm] = useState(() => ({
    title: record.title ?? "",
    description: record.description ?? "",
    category: record.category ?? "other",
    priority: record.priority ?? "normal",
    status: record.status ?? "open",
    assignee: record.assignee ?? "",
    resolution_notes: record.resolution_notes ?? "",
  }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = t("field_required");
    // 从其他状态改为已解决时，必须填写处理说明
    if (form.status === "resolved" && record.status !== "resolved" && !form.resolution_notes.trim()) {
      nextErrors.resolution_notes = t("resolution_notes_required");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await request("/maintenance/update", {
        id: record.id,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        status: form.status,
        assignee: form.assignee.trim(),
        resolution_notes: form.resolution_notes.trim(),
      });
      toast.success(t("record_saved"));
      reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, t, { fallbackKey: "save_failed" }));
    } finally {
      setSubmitting(false);
    }
  }

  const summary = [
    [
      t("status"),
      <StatusBadge key="status" value={record.status} options={statusItems} />,
    ],
    [
      t("priority"),
      <StatusBadge key="priority" value={record.priority} options={priorityItems} />,
    ],
    [t("category"), categoryMap[record.category]?.label ?? record.category],
    [
      t("property_and_unit"),
      [record.property_name, record.unit_code].filter(Boolean).join(" · ") || "-",
    ],
    [t("assignee"), record.assignee || "-"],
    [t("resolved_at"), fdl(record.resolved_at) || "-"],
  ];

  return (
    <FormPage
      title={record.title}
      subtitle={t("maintenance_timestamps", {
        created: fdl(record.created_at),
        updated: fdl(record.updated_at),
      })}
      backLabel={t("maintenance_requests")}
      backHref="/maintenance"
      onSubmit={handleSubmit}
      actions={
        <div className="flex gap-3">
          <Link className="btn btn-outline" href="/maintenance">
            {t("back_to_maintenance")}
          </Link>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner size="sm" label={t("saving")} /> {t("saving")}
              </>
            ) : (
              t("save_changes")
            )}
          </button>
        </div>
      }
    >
      <dl className="mb-[var(--section-gap)] grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {summary.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-scene p-4">
            <dt className="text-xs font-semibold text-subtle">{label}</dt>
            <dd className="mt-2 text-sm font-semibold text-scene-content">{value}</dd>
          </div>
        ))}
      </dl>

      <FormSection title={t("details")}>
        <Input
          label={t("title")}
          name="title"
          value={form.title}
          required
          error={errors.title}
          onChange={(v) => updateField("title", v)}
        />
        <Select
          label={t("category")}
          name="category"
          value={form.category}
          options={categoryItems}
          onChange={(v) => updateField("category", v)}
        />
        <Textarea
          label={t("description")}
          name="description"
          value={form.description}
          rows={4}
          onChange={(v) => updateField("description", v)}
        />
      </FormSection>

      <FormSection title={t("workflow_section")}>
        <Select
          label={t("status")}
          name="status"
          value={form.status}
          options={statusItems}
          onChange={(v) => updateField("status", v)}
        />
        <Select
          label={t("priority")}
          name="priority"
          value={form.priority}
          options={priorityItems}
          onChange={(v) => updateField("priority", v)}
        />
        <Input
          label={t("assignee")}
          name="assignee"
          value={form.assignee}
          onChange={(v) => updateField("assignee", v)}
        />
        <Textarea
          label={t("resolution_notes")}
          name="resolution_notes"
          value={form.resolution_notes}
          rows={4}
          required={form.status === "resolved"}
          error={errors.resolution_notes}
          onChange={(v) => updateField("resolution_notes", v)}
        />
      </FormSection>
    </FormPage>
  );
}