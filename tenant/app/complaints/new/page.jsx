"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { FormPage, FormSection, Input, Select, Textarea, useToast } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { useDropdown } from "@/hooks/useDropdown";
import { complaintCreate } from "@/services/tenant-portal/complaint";

export default function NewComplaintPage() {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const { optionsOf } = useDropdown(["complaint_category"]);
  const categoryOptions = optionsOf("complaint_category");
  const [form, setForm] = useState({ title: "", description: "", category: "other" });
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
      const created = await complaintCreate({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
      });
      toast.success(t("record_saved"));
      router.push(created?.id ? `/complaints/${created.id}` : "/complaints");
    } catch (err) {
      toast.error(err?.message || t("save_failed"));
      setSaving(false);
    }
  }

  return (
    <FormPage
      title={t("new_complaint")}
      subtitle={t("new_complaint_description")}
      backLabel={t("complaints")}
      backHref="/complaints"
      onSubmit={handleSubmit}
      size="md"
      actions={(
        <div className="flex gap-3">
          <button type="button" className="btn btn-outline" onClick={() => router.push("/complaints")} disabled={saving}>
            {t("cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("submit_complaint")}
          </button>
        </div>
      )}
    >
      <FormSection title={t("details")}>
        <Input label={t("title")} name="title" value={form.title} required error={errors.title} onChange={(v) => updateField("title", v)} />
        <Select label={t("category")} name="category" value={form.category} options={categoryOptions} onChange={(v) => updateField("category", v)} />
        <Textarea label={t("description")} name="description" value={form.description} rows={5} onChange={(v) => updateField("description", v)} />
      </FormSection>
    </FormPage>
  );
}
