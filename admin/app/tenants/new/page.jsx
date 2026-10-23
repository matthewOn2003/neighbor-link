"use client";

import { useState } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useDropdown } from "@/hooks/useDropdown";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { FormPage, FormSection, Select, Input, CopyableField, useToast } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";

const EMPTY_FORM = {
  username: "",
  name: "",
  phone: "",
  email: "",
  property_id: "",
  unit_id: "",
  status: "active",
};

export default function NewTenantPage() {
  const { t } = useLocale();
  const router = useRouter();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);

  const { data: propertyData } = useApiRequest("/property/list", { per_page: 100 });
  const { data: unitData } = useApiRequest("/property/unit/list", {
    property_id: form.property_id,
    status: "vacant",
    per_page: 100,
  });
  const { optionsOf } = useDropdown(["tenant_status"]);

  const properties = propertyData?.list ?? [];
  const units = form.property_id ? (unitData?.list ?? []) : [];

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  // 换房产时清空已选单位，因为单位列表依赖房产
  function changeProperty(value) {
    setForm((current) => ({ ...current, property_id: value, unit_id: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = t("field_required");
    if (!form.name.trim()) nextErrors.name = t("field_required");
    if (!form.phone.trim()) nextErrors.phone = t("field_required");
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const result = await request("/tenant/create", {
        username: form.username.trim(),
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        property_id: form.property_id ? Number(form.property_id) : null,
        unit_id: form.unit_id ? Number(form.unit_id) : null,
        status: form.status,
      });
      setCreated(result);
      toast.success(t("tenant_created"));
    } catch (err) {
      toast.error(
        err.code === "UNIT_NOT_VACANT" ? t("unit_not_vacant") : t("failed_to_create_tenant")
      );
    } finally {
      setSaving(false);
    }
  }

  if (created) {
    return (
      <FormPage
        title={t("tenant_created")}
        subtitle={t("save_password_notice")}
        backLabel={t("tenants")}
        backHref="/tenants"
        actions={
          <div className="flex gap-3">
            <Link href="/tenants" className="btn btn-outline">
              {t("back_to_tenants")}
            </Link>
            <Link href={`/tenants/${created.id}`} className="btn btn-primary">
              {t("view_tenant")}
            </Link>
          </div>
        }
        size="md"
      >
        <FormSection title={t("login_credentials")}>
          <CopyableField label={t("username")} value={created.username} />
          <CopyableField label={t("generated_password")} value={created.generated_password} />
        </FormSection>
      </FormPage>
    );
  }

  return (
    <FormPage
      title={t("new_tenant")}
      subtitle={t("create_tenant_description")}
      backLabel={t("tenants")}
      backHref="/tenants"
      onSubmit={handleSubmit}
      size="md"
      actions={
        <div className="flex gap-3">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => router.push("/tenants")}
            disabled={saving}
          >
            {t("cancel")}
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? (
              <>
                <Spinner size="sm" label={t("saving")} /> {t("saving")}
              </>
            ) : (
              t("create_tenant")
            )}
          </button>
        </div>
      }
    >
      <FormSection title={t("details")}>
        <Input
          label={t("username")}
          name="username"
          value={form.username}
          onChange={(v) => updateField("username", v)}
          required
          error={errors.username}
        />
        <Input
          label={t("name")}
          name="name"
          value={form.name}
          onChange={(v) => updateField("name", v)}
          required
          error={errors.name}
        />
        <Input
          label={t("phone")}
          name="phone"
          value={form.phone}
          onChange={(v) => updateField("phone", v)}
          required
          error={errors.phone}
        />
        <Input
          label={t("email")}
          name="email"
          type="email"
          value={form.email}
          onChange={(v) => updateField("email", v)}
        />
        <Select
          label={t("property")}
          name="property_id"
          value={form.property_id}
          onChange={changeProperty}
          options={properties.map((p) => ({ label: p.name, value: String(p.id) }))}
          placeholder={t("no_property_assigned")}
        />
        <Select
          label={t("unit")}
          name="unit_id"
          value={form.unit_id}
          onChange={(v) => updateField("unit_id", v)}
          options={units.map((u) => ({ label: u.code, value: String(u.id) }))}
          placeholder={form.property_id ? t("no_vacant_units") : t("select_property_first")}
        />
        <Select
          label={t("status")}
          name="status"
          value={form.status}
          onChange={(v) => updateField("status", v)}
          options={optionsOf("tenant_status")}
          placeholder={t("select_status")}
        />
      </FormSection>
    </FormPage>
  );
}