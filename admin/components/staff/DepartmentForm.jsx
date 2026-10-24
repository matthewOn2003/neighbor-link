"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { FormPage, FormSection, Input, Select, Textarea, useToast, Spinner } from "@/components/ui";
import { useStatusOptions } from "./common";
import { apiErrorMessage } from "@/utils/errors";
import { request } from "@/hooks/useApiRequest";
import { api } from "@/services/api";

const EMPTY_FORM = {
  name: "",
  code: "",
  description: "",
  manager_name: "",
  location: "",
  phone: "",
  status: "active",
};

export function DepartmentForm({ record }) {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const statusOptions = useStatusOptions();
  const [form, setForm] = useState(() => (record ? { ...EMPTY_FORM, ...record } : EMPTY_FORM));
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
    if (!form.name.trim()) nextErrors.name = t("field_required");
    if (!form.code.trim()) nextErrors.code = t("field_required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const body = {
      name: form.name.trim(),
      code: form.code.trim(),
      description: form.description.trim(),
      manager_name: form.manager_name.trim(),
      location: form.location.trim(),
      phone: form.phone.trim(),
      status: form.status,
    };

    setSubmitting(true);
    try {
      if (isEdit) {
        await request(api.staffDepartment.update, { id: record.id, ...body });
      } else {
        await request(api.staffDepartment.create, body);
      }
      toast.success(t("record_saved"));
      router.push("/departments");
    } catch (err) {
      toast.error(apiErrorMessage(err, t, { fallbackKey: "save_failed" }));
    } finally {
      setSubmitting(false);
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
          <button type="button" className="btn btn-outline" onClick={() => router.push("/departments")} disabled={submitting}>
            {t("cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("save_changes")}
          </button>
        </div>
      )}
    >
      <FormSection title={t("details")}>
        <Input label={t("department_name")} name="name" value={form.name} onChange={(v) => updateField("name", v)} required error={errors.name} />
        <Input label={t("code")} name="code" value={form.code} onChange={(v) => updateField("code", v)} required error={errors.code} />
        <Input label={t("manager_name")} name="manager_name" value={form.manager_name} onChange={(v) => updateField("manager_name", v)} />
        <Input label={t("location")} name="location" value={form.location} onChange={(v) => updateField("location", v)} />
        <Input label={t("phone")} name="phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
        <Textarea label={t("description")} name="description" value={form.description} onChange={(v) => updateField("description", v)} rows={3} />
        <Select label={t("status")} name="status" value={form.status} onChange={(v) => updateField("status", v)} options={statusOptions} />
      </FormSection>
    </FormPage>
  );
}
