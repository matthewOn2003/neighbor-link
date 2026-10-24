"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useDropdown } from "@/hooks/useDropdown";
import { FormPage, FormSection, Input, Select, Textarea, useToast } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { positionCreate, positionUpdate } from "@/services/staff/position";
import { useStatusOptions } from "./common";
import { PermissionTree, parsePermissionIds } from "./PermissionTree";
import { apiErrorMessage } from "@/utils/errors";

const EMPTY_FORM = {
  department_id: "",
  name: "",
  code: "",
  description: "",
  level: "staff",
  employment_type: "full_time",
  permission_ids: [],
  status: "active",
};

export function PositionForm({ record }) {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const statusOptions = useStatusOptions();
  const { data: departmentData } = useApiRequest("/staff-department/list", { per_page: 100 });
  const departments = departmentData?.list ?? [];
  const { optionsOf } = useDropdown(["position_level", "employment_type"]);

  const [form, setForm] = useState(() =>
    record
      ? {
        ...EMPTY_FORM,
        ...record,
        department_id: String(record.department_id),
        permission_ids: parsePermissionIds(record.permission_ids),
      }
      : EMPTY_FORM,
  );
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(record);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.department_id) nextErrors.department_id = t("field_required");
    if (!form.name.trim()) nextErrors.name = t("field_required");
    if (!form.code.trim()) nextErrors.code = t("field_required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body = {
      department_id: Number(form.department_id),
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      level: form.level,
      employment_type: form.employment_type,
      permission_ids: form.permission_ids,
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await positionUpdate(record.id, body);
      } else {
        await positionCreate(body);
      }
      toast.success(t("record_saved"));
      router.push("/positions");
    } catch (err) {
      toast.error(apiErrorMessage(err, t, { fallbackKey: "save_failed" }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormPage
      title={isEdit ? t("edit_position") : t("new_position")}
      subtitle={t("positions_description")}
      backLabel={t("positions")}
      backHref="/positions"
      onSubmit={handleSubmit}
      size="md"
      actions={(
        <div className="flex gap-3">
          <button type="button" className="btn btn-outline" onClick={() => router.push("/positions")} disabled={submitting}>
            {t("cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("save_changes")}
          </button>
        </div>
      )}
    >
      <FormSection title={t("details")}>
        <Select
          label={t("department")}
          name="department_id"
          value={form.department_id}
          onChange={(v) => updateField("department_id", v)}
          options={departments.map((d) => ({ label: d.name, value: String(d.id) }))}
          placeholder={t("select_department")}
          required
          error={errors.department_id}
        />
        <Input label={t("position_name")} name="name" value={form.name} onChange={(v) => updateField("name", v)} required error={errors.name} />
        <Input label={t("code")} name="code" value={form.code} onChange={(v) => updateField("code", v)} required error={errors.code} />
        <Select label={t("level")} name="level" value={form.level} onChange={(v) => updateField("level", v)} options={optionsOf("position_level")} />
        <Select label={t("employment_type")} name="employment_type" value={form.employment_type} onChange={(v) => updateField("employment_type", v)} options={optionsOf("employment_type")} />
        <Select label={t("status")} name="status" value={form.status} onChange={(v) => updateField("status", v)} options={statusOptions} />
        <Textarea label={t("description")} name="description" value={form.description} onChange={(v) => updateField("description", v)} rows={3} />
      </FormSection>

      <FormSection title={t("permission_tree")}>
        <PermissionTree value={form.permission_ids} onChange={(v) => updateField("permission_ids", v)} />
      </FormSection>
    </FormPage>
  );
}
