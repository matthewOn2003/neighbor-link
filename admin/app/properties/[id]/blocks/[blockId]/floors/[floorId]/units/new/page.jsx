"use client";

import { use, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { FormPage, FormSection, Input, Select, useToast, Spinner } from "@/components/ui";
import { useDropdown } from "@/hooks/useDropdown";
import { useApiRequest, request } from "@/hooks/useApiRequest";
import { useLocale } from "@/i18n";
import { apiErrorMessage } from "@/utils/errors";
import { api } from "@/services/api";

const EMPTY_FORM = { code: "", bedrooms: "", size_sqft: "", status: "vacant" };

export default function NewUnitPage({ params }) {
  const { id, blockId, floorId } = use(params);
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();
  const { data: floor } = useApiRequest(api.property.floorDetail, { id: Number(floorId) });
  const { optionsOf } = useDropdown(["unit_status"]);
  const statusOptions = optionsOf("unit_status");
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const floorHref = `/properties/${id}/blocks/${blockId}/floors/${floorId}`;

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!form.code.trim()) nextErrors.code = t("field_required");
    if (form.bedrooms === "" || Number(form.bedrooms) < 0) {
      nextErrors.bedrooms = t("field_required");
    }
    if (form.size_sqft === "" || Number(form.size_sqft) < 0) {
      nextErrors.size_sqft = t("field_required");
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await request(api.property.unitCreate, {
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
      toast.error(
        apiErrorMessage(err, t, {
          fallbackKey: "unit_save_failed",
          codes: { CODE_EXISTS: "unit_code_exists", INVALID_FLOOR: "invalid_floor", INVALID_STATUS: "invalid_unit_status" },
          serverMessage: false,
        })
      );
    } finally {
      setSubmitting(false);
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
      actions={
        <div className="flex gap-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => router.push(floorHref)}
            disabled={submitting}
          >
            {t("cancel")}
          </button>
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
      <FormSection title={t("details")}>
        <Input
          label={t("unit_code")}
          name="code"
          value={form.code}
          onChange={(v) => updateField("code", v)}
          required
          error={errors.code}
        />
        <Input
          label={t("bedrooms")}
          name="bedrooms"
          type="number"
          value={form.bedrooms}
          onChange={(v) => updateField("bedrooms", v)}
          required
          error={errors.bedrooms}
        />
        <Input
          label={t("size_sqft")}
          name="size_sqft"
          type="number"
          value={form.size_sqft}
          onChange={(v) => updateField("size_sqft", v)}
          required
          error={errors.size_sqft}
        />
        <Select
          label={t("status")}
          name="status"
          value={form.status}
          onChange={(v) => updateField("status", v)}
          options={statusOptions}
        />
      </FormSection>
    </FormPage>
  );
}