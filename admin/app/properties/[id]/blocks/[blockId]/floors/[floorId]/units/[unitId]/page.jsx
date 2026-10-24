"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { EmptyState, FormPage, FormSection, Input, Select, useToast, Spinner } from "@/components/ui";
import { useDropdown } from "@/hooks/useDropdown";
import { useApiRequest, request } from "@/hooks/useApiRequest";
import { useLocale } from "@/i18n";
import { apiErrorMessage } from "@/utils/errors";

// There is no single-unit endpoint, so page through the floor's units until the id is found.
async function findUnitOnFloor(floorId, unitId) {
  let page = 1;
  let lastPage = 1;
  do {
    const res = await request("/property/unit/list", {
      floor_id: String(floorId),
      current_page: page,
      per_page: 100,
    });
    const found = (res?.list ?? []).find((row) => String(row.id) === String(unitId));
    if (found) return found;
    lastPage = res?.pagination?.last_page ?? 1;
    page += 1;
  } while (page <= lastPage);
  return null;
}

export default function EditUnitPage({ params }) {
  const { id, blockId, floorId, unitId } = use(params);
  const { t } = useLocale();
  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const { data: floor } = useApiRequest("/property/floor/detail", { id: Number(floorId) });
  const floorHref = `/properties/${id}/blocks/${blockId}/floors/${floorId}`;

  useEffect(() => {
    let cancelled = false;
    findUnitOnFloor(floorId, unitId)
      .then((found) => {
        if (!cancelled) setUnit(found);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err?.message || t("unit_not_found"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // t is stable per locale; reload only when the route target changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorId, unitId]);

  const backLabel = floor ? t("floor_level", { level: floor.level }) : t("loading");

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Spinner size="lg" label={t("loading")} />
      </div>
    );
  }

  if (loadError || !unit) {
    return (
      <FormPage title={t("edit_unit")} backLabel={backLabel} backHref={floorHref}>
        <EmptyState title={loadError || t("unit_not_found")} />
      </FormPage>
    );
  }

  return (
    <EditUnitForm
      key={unit.id}
      unit={unit}
      floorHref={floorHref}
      backLabel={backLabel}
      unitId={unitId}
    />
  );
}

function EditUnitForm({ unit, floorHref, backLabel, unitId }) {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();

  const { optionsOf } = useDropdown(["unit_status"]);
  const statusOptions = optionsOf("unit_status");

  const [form, setForm] = useState({
    code: unit.code ?? "",
    bedrooms: String(unit.bedrooms ?? ""),
    size_sqft: String(unit.size_sqft ?? ""),
    status: unit.status ?? "vacant",
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
      await request("/property/unit/update", {
        id: Number(unitId),
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
          codes: {
            CODE_EXISTS: "unit_code_exists",
            INVALID_STATE: "unit_vacant_blocked",
            INVALID_STATUS: "invalid_unit_status",
            NOT_FOUND: "unit_not_found",
          },
          serverMessage: false,
        })
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <FormPage
      title={t("edit_unit")}
      subtitle={t("unit_form_description")}
      backLabel={backLabel}
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
        {unit.tenant_name ? (
          <p className="text-sm text-subtle">{t("unit_has_tenant_hint")}</p>
        ) : null}
      </FormSection>
    </FormPage>
  );
}