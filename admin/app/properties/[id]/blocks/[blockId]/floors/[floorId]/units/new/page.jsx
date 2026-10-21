"use client";

import { use, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { FormPage, FormSection, Input, Select, useToast } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { useDropdown } from "@/hooks/useDropdown";
import { useRequest } from "@/hooks/useRequest";
import { useLocale } from "@/i18n";
import { request } from "@/services/request";

const EMPTY_FORM = { code: "", bedrooms: "", size_sqft: "", status: "vacant" };

function unitErrorMessage(err, t) {
  if (err?.code === "CODE_EXISTS") return t("unit_code_exists");
  if (err?.code === "INVALID_FLOOR") return t("invalid_floor");
  if (err?.code === "INVALID_STATUS") return t("invalid_unit_status");
  return t("unit_save_failed");
}

export default function NewUnitPage({ params }) {
  const { id, blockId, floorId } = use(params);
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const { data: floor } = useRequest(`/property/floor/${floorId}`);
  const { optionsOf } = useDropdown(["unit_status"]);
  const statusOptions = optionsOf("unit_status");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const floorHref = `/properties/${id}/blocks/${blockId}/floors/${floorId}`;

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.code.trim()) nextErrors.code = t("field_required");
    if (form.bedrooms === "" || Number(form.bedrooms) < 0) nextErrors.bedrooms = t("field_required");
    if (form.size_sqft === "" || Number(form.size_sqft) < 0) nextErrors.size_sqft = t("field_required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      await request("/property/unit/create", {
        block_id: Number(blockId),
        floor_id: Number(floorId),
        code: form.code.trim(),
        bedrooms: Number(form.bedrooms),
        size_sqft: Number(form.size_sqft),
        status: form.status,
      });
      toast.success(t("record_saved"));
      router.push(floorHref);
    } catch (err) {
      toast.error(unitErrorMessage(err, t));
    } finally {
      setSaving(false);
    }
  }

  return (
    <FormPage
      title={t("new_unit")}
      subtitle={t("unit_form_description")}
      backLabel={floor ? t("floor_level", { level: floor.level }) : t("loading")}
      backHref={floorHref}
      onSubmit={handleSubmit}
      size="md"
      actions={(
        <div className="flex gap-3">
          <button type="button" className="btn btn-outline" onClick={() => router.push(floorHref)} disabled={saving}>
            {t("cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("save_changes")}
          </button>
        </div>
      )}
    >
      <FormSection title={t("details")}>
        <Input label={t("unit_code")} name="code" value={form.code} onChange={(v) => updateField("code", v)} required error={errors.code} />
        <Input label={t("bedrooms")} name="bedrooms" type="number" value={form.bedrooms} onChange={(v) => updateField("bedrooms", v)} required error={errors.bedrooms} />
        <Input label={t("size_sqft")} name="size_sqft" type="number" value={form.size_sqft} onChange={(v) => updateField("size_sqft", v)} required error={errors.size_sqft} />
        <Select label={t("status")} name="status" value={form.status} onChange={(v) => updateField("status", v)} options={statusOptions} />
      </FormSection>
    </FormPage>
  );
}
