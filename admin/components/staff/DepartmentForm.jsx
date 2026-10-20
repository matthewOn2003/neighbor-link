"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { FormPage, FormSection, Input, Select, Textarea, useToast } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { departmentCreate, departmentUpdate } from "@/services/staff/department";
import { saveErrorMessage, useStatusOptions } from "./common";

const EMPTY_FORM = { name: "", code: "", description: "", status: "active" };

export function DepartmentForm({ record }) {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const statusOptions = useStatusOptions();
  const [form, setForm] = useState(() => (record ? { ...EMPTY_FORM, ...record } : EMPTY_FORM));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = Boolean(record);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = t("field_required");
    if (!form.code.trim()) nextErrors.code = t("field_required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      status: form.status,
    };

    setSaving(true);
    try {
      if (isEdit) {
        await departmentUpdate(record.id, body);
      } else {
        await departmentCreate(body);
      }
      toast.success(t("record_saved"));
      router.push("/departments");
    } catch (err) {
      toast.error(saveErrorMessage(err, t, "save_failed"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormPage
      title={isEdit ? t("edit_department") : t("new_department")}
      subtitle={t("departments_description")}
      backLabel={t("departments")}
      backHref="/departments"
      onSubmit={handleSubmit}
      size="md"
      actions={(
        <div className="flex gap-3">
          <button type="button" className="btn btn-outline" onClick={() => router.push("/departments")} disabled={saving}>
            {t("cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("save_changes")}
          </button>
        </div>
      )}
    >
      <FormSection title={t("details")}>
        <Input label={t("department_name")} name="name" value={form.name} onChange={(v) => updateField("name", v)} required error={errors.name} />
        <Input label={t("code")} name="code" value={form.code} onChange={(v) => updateField("code", v)} required error={errors.code} />
        <Textarea label={t("description")} name="description" value={form.description} onChange={(v) => updateField("description", v)} rows={3} />
        <Select label={t("status")} name="status" value={form.status} onChange={(v) => updateField("status", v)} options={statusOptions} />
      </FormSection>
    </FormPage>
  );
}
