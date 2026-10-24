"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { FormPage, FormSection, Input, Select, Textarea, useToast } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { useDropdown } from "@/hooks/useDropdown";
import { useApiRequest } from "@/hooks/useApiRequest";
import { request } from "@/services/request";
import { apiErrorMessage } from "@/utils/errors";

export default function NewMaintenancePage() {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const { optionsOf } = useDropdown(["maintenance_category", "maintenance_priority"]);
  const categoryOptions = optionsOf("maintenance_category");
  const priorityOptions = optionsOf("maintenance_priority");
  const { data: propertyData } = useApiRequest("/property/list", { per_page: 100 });
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "normal",
    property_id: "",
    unit_id: "",
    assignee: "",
  });
  // 单元只在选定物业后加载；维修单必须关联到单元，物业由单元推导
  const { data: unitData } = useApiRequest("/property/unit/list", { property_id: form.property_id, per_page: 100 });
  const units = form.property_id ? (unitData?.list ?? []) : [];
  const propertyOptions = (propertyData?.list ?? []).map((property) => ({
    value: String(property.id),
    label: property.name,
  }));
  const unitOptions = units.map((unit) => ({ value: String(unit.id), label: unit.code }));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function changeProperty(propertyId) {
    setForm((current) => ({ ...current, property_id: propertyId, unit_id: "" }));
    setErrors((current) => ({ ...current, property_id: undefined, unit_id: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = t("field_required");
    if (!form.property_id) nextErrors.property_id = t("field_required");
    if (!form.unit_id) nextErrors.unit_id = t("field_required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const created = await request("/maintenance/create", {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
        unit_id: form.unit_id,
        assignee: form.assignee.trim(),
      });
      toast.success(t("record_saved"));
      router.push(created?.id ? `/maintenance/${created.id}` : "/maintenance");
    } catch (err) {
      toast.error(apiErrorMessage(err, t, { fallbackKey: "save_failed" }));
      setSubmitting(false);
    }
  }

  return (
    <FormPage
      title={t("new_maintenance_request")}
      subtitle={t("new_maintenance_description")}
      backLabel={t("maintenance_requests")}
      backHref="/maintenance"
      onSubmit={handleSubmit}
      size="md"
      actions={(
        <div className="flex gap-3">
          <button type="button" className="btn btn-outline" onClick={() => router.push("/maintenance")} disabled={submitting}>
            {t("cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("submit_request")}
          </button>
        </div>
      )}
    >
      <FormSection title={t("details")}>
        <Input label={t("title")} name="title" value={form.title} required error={errors.title} onChange={(v) => updateField("title", v)} />
        <Textarea label={t("description")} name="description" value={form.description} rows={4} onChange={(v) => updateField("description", v)} />
        <Select label={t("category")} name="category" value={form.category} options={categoryOptions} onChange={(v) => updateField("category", v)} />
        <Select label={t("priority")} name="priority" value={form.priority} options={priorityOptions} onChange={(v) => updateField("priority", v)} />
      </FormSection>

      <FormSection title={t("location")}>
        <Select
          label={t("property")}
          name="property_id"
          required
          value={form.property_id}
          error={errors.property_id}
          placeholder={t("select_placeholder")}
          options={propertyOptions}
          onChange={changeProperty}
        />
        <Select
          label={t("unit")}
          name="unit_id"
          required
          value={form.unit_id}
          error={errors.unit_id}
          placeholder={form.property_id ? t("select_unit") : t("select_property_first")}
          options={unitOptions}
          onChange={(v) => updateField("unit_id", v)}
        />
        <Input label={t("assignee")} name="assignee" value={form.assignee} onChange={(v) => updateField("assignee", v)} />
      </FormSection>
    </FormPage>
  );
}
