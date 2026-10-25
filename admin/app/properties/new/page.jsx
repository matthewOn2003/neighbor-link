"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useApiData } from "@/hooks/useApiData";
import { apiRequest } from "@/utils/apiRequest";
import { useDropdown } from "@/hooks/useDropdown";
import { useLocale } from "@/i18n";
import { FormPage, FormSection, Select, Textarea, Input, useToast, Spinner } from "@/components/ui";

const EMPTY_FORM = {
  name: "",
  developer_id: "",
  property_type: "condo",
  region: "",
  address: "",
  city: "",
  cover_image: "",
  description: "",
  wifi_ssid: "",
  wifi_password: "",
  notes: "",
};

export default function NewPropertyPage() {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { data: facets } = useApiData("/property/facets");
  const { optionsOf } = useDropdown(["property_type", "property_region"]);
  const developers = facets?.developers ?? [];

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!form.name.trim()) nextErrors.name = t("field_required");
    if (!form.address.trim()) nextErrors.address = t("field_required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const property = await apiRequest("/property/create", {
        name: form.name.trim(),
        developer_id: form.developer_id ? Number(form.developer_id) : null,
        property_type: form.property_type,
        region: form.region,
        address: form.address.trim(),
        city: form.city.trim(),
        cover_image: form.cover_image.trim() || null,
        description: form.description.trim(),
        wifi_ssid: form.wifi_ssid.trim(),
        wifi_password: form.wifi_password,
        notes: form.notes.trim(),
      });
      toast.success(t("property_created"));
      router.push(`/properties/${property.id}`);
    } catch {
      toast.error(t("failed_to_create_property"));
      setSubmitting(false);
    }
  }

  return (
    <FormPage
      title={t("new_property")}
      subtitle={t("create_property_description")}
      backLabel={t("properties")}
      backHref="/properties"
      onSubmit={handleSubmit}
      size="md"
      actions={
        <div className="flex gap-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => router.push("/properties")}
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
              t("create_property")
            )}
          </button>
        </div>
      }
    >
      <FormSection title={t("details")}>
        <Input
          label={t("name")}
          name="name"
          value={form.name}
          onChange={(v) => updateField("name", v)}
          required
          error={errors.name}
        />
        <Select
          label={t("developer")}
          name="developer_id"
          value={form.developer_id}
          onChange={(v) => updateField("developer_id", v)}
          options={developers.map((d) => ({ label: d.name, value: String(d.id) }))}
          placeholder={t("select_developer")}
        />
        <Select
          label={t("property_type")}
          name="property_type"
          value={form.property_type}
          onChange={(v) => updateField("property_type", v)}
          options={optionsOf("property_type")}
        />
        <Select
          label={t("region")}
          name="region"
          value={form.region}
          onChange={(v) => updateField("region", v)}
          options={optionsOf("property_region")}
          placeholder={t("select_region")}
        />
        <Input
          label={t("address")}
          name="address"
          value={form.address}
          onChange={(v) => updateField("address", v)}
          required
          error={errors.address}
        />
        <Input
          label={t("city")}
          name="city"
          value={form.city}
          onChange={(v) => updateField("city", v)}
        />
        <Input
          label={t("cover_image_url")}
          name="cover_image"
          type="url"
          placeholder="https://"
          value={form.cover_image}
          onChange={(v) => updateField("cover_image", v)}
        />
        <Textarea
          label={t("description")}
          name="description"
          value={form.description}
          onChange={(v) => updateField("description", v)}
        />
        <Input
          label={t("wifi_ssid")}
          name="wifi_ssid"
          value={form.wifi_ssid}
          onChange={(v) => updateField("wifi_ssid", v)}
        />
        <Input
          label={t("wifi_password")}
          name="wifi_password"
          value={form.wifi_password}
          onChange={(v) => updateField("wifi_password", v)}
        />
        <Textarea
          label={t("notes")}
          name="notes"
          value={form.notes}
          onChange={(v) => updateField("notes", v)}
        />
      </FormSection>
    </FormPage>
  );
}