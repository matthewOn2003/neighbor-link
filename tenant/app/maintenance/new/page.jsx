"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { FormPage, FormSection, Input, Select, Textarea, useToast } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { useDropdown } from "@/hooks/useDropdown";
import { maintenanceCreate } from "@/services/tenant-portal/maintenance";

// 租户只能提交普通或高优先级；紧急由管理员设置。单元由后端根据租户绑定的单元推导。
const TENANT_PRIORITIES = ["normal", "high"];

export default function NewMaintenancePage() {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const { optionsOf } = useDropdown(["maintenance_category", "maintenance_priority"]);
  const categoryOptions = optionsOf("maintenance_category");
  const priorityOptions = optionsOf("maintenance_priority").filter((item) => TENANT_PRIORITIES.includes(item.value));
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "other",
    priority: "normal",
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.title.trim()) nextErrors.title = t("field_required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const created = await maintenanceCreate({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority,
      });
      toast.success(t("record_saved"));
      router.push(created?.id ? `/maintenance/${created.id}` : "/maintenance");
    } catch (err) {
      toast.error(err?.message || t("save_failed"));
      setSaving(false);
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
          <button type="button" className="btn btn-outline" onClick={() => router.push("/maintenance")} disabled={saving}>
            {t("cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("submit_request")}
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
    </FormPage>
  );
}
