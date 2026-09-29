"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { useProperties } from "@/lib/useProperties";
import { useDictionary } from "@/lib/useDictionary";
import { FormPage, FormSection, Select, Input, CopyableField, useToast } from "@/app/components/ui";

const EMPTY_FORM = { username: "", name: "", phone: "", email: "", property_id: "", status: "" };

export default function NewTenantPage() {
  const router = useRouter();
  const request = useApi();
  const toast = useToast();
  const { properties } = useProperties();
  const { options: statusOptions } = useDictionary("tenant_status");

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState(null);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.username || !form.username.trim()) nextErrors.username = "Username is required";
    if (!form.name || !form.name.trim()) nextErrors.name = "Name is required";
    if (!form.phone || !form.phone.trim()) nextErrors.phone = "Phone is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const res = await request("/tenant/create", {
        username: form.username,
        name: form.name,
        phone: form.phone,
        email: form.email,
        property_id: form.property_id ? Number(form.property_id) : null,
        status: form.status,
      });
      setCreated(res.data);
      toast.success("Tenant created");
    } catch {
      toast.error("Failed to create tenant");
    } finally {
      setSaving(false);
    }
  }

  if (created) {
    return (
      <FormPage
        title="Tenant created"
        subtitle="Save this one-time password — it won't be shown again."
        backLabel="Tenants"
        backHref="/tenants"
        actions={
          <div className="flex gap-3">
            <Link href="/tenants" className="btn btn-secondary">Back to tenants</Link>
            <Link href={`/tenants/${created.id}`} className="btn btn-primary">View tenant</Link>
          </div>
        }
        size="md"
      >
        <FormSection title="Login credentials">
          <CopyableField label="Username" value={created.username} />
          <CopyableField label="Generated password" value={created.generated_password} />
        </FormSection>
      </FormPage>
    );
  }

  return (
    <FormPage
      title="New tenant"
      subtitle="Create a tenant account and assign a property."
      backLabel="Tenants"
      backHref="/tenants"
      onSubmit={handleSubmit}
      actions={
        <div className="flex gap-3">
          <button type="button" className="btn btn-secondary" onClick={() => router.push("/tenants")} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Create tenant"}
          </button>
        </div>
      }
    >
      <FormSection title="Details">
        <Input label="Username" name="username" value={form.username} onChange={(v) => updateField("username", v)} required error={errors.username} />
        <Input label="Name" name="name" value={form.name} onChange={(v) => updateField("name", v)} required error={errors.name} />
        <Input label="Phone" name="phone" value={form.phone} onChange={(v) => updateField("phone", v)} required error={errors.phone} />
        <Input label="Email" name="email" type="email" value={form.email} onChange={(v) => updateField("email", v)} />
        <Select
          label="Property"
          name="property_id"
          value={form.property_id}
          onChange={(v) => updateField("property_id", v)}
          options={properties.map((p) => ({ label: p.name, value: String(p.id) }))}
          placeholder="No property assigned"
        />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(v) => updateField("status", v)}
          options={statusOptions.map((o) => ({ label: o.label, value: o.value }))}
        />
      </FormSection>
    </FormPage>
  );
}