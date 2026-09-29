"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { useProperties } from "@/lib/useProperties";
import { useDictionary } from "@/lib/useDictionary";
import { PageHeader, Breadcrumb, FormSection, FormActions, ConfirmDialog, Select, Input, useToast } from "@/app/components/ui";

export default function TenantDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const request = useApi();
  const toast = useToast();
  const { properties } = useProperties();
  const { options: statusOptions } = useDictionary("tenant_status");

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setLoading(true);
    request(`/tenant/detail/${id}`, undefined, { method: "GET" })
      .then((res) => {
        setForm(res.data);
      })
      .catch(() => {
        toast.error("Failed to load tenant");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name || !form.name.trim()) {
      nextErrors.name = "Name is required";
    }
    if (!form.phone || !form.phone.trim()) {
      nextErrors.phone = "Phone is required";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await request(`/tenant/update/${id}`, form);
      toast.success("Tenant updated");
    } catch {
      toast.error("Failed to update tenant");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await request(`/tenant/delete/${id}`, undefined, { method: "POST" });
      toast.success("Tenant deleted");
      router.push("/tenants");
    } catch {
      toast.error("Failed to delete tenant");
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "var(--page-padding-block) var(--page-padding-inline)" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ padding: "var(--page-padding-block) var(--page-padding-inline)" }}>
      <Breadcrumb
        items={[
          { label: "Tenants", href: "/tenants" },
          { label: form?.name || `#${id}` },
        ]}
      />
      <PageHeader
        title={form?.name || `Tenant #${id}`}
        description="View and edit tenant details."
        actions={
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => setConfirmOpen(true)}
          >
            Delete
          </button>
        }
      />
      <form onSubmit={handleSubmit}>
        <FormSection title="Details">
          <Input
            label="Name"
            name="name"
            value={form?.name || ""}
            onChange={(v) => updateField("name", v)}
            required
            error={errors.name}
          />
          <Input
            label="Phone"
            name="phone"
            value={form?.phone || ""}
            onChange={(v) => updateField("phone", v)}
            required
            error={errors.phone}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={form?.email || ""}
            onChange={(v) => updateField("email", v)}
          />
          <Select
            label="Property"
            name="property_id"
            value={form?.property_id !== undefined && form?.property_id !== null ? String(form.property_id) : ""}
            onChange={(v) => updateField("property_id", v ? Number(v) : null)}
            options={properties.map((property) => ({ label: property.name, value: String(property.id) }))}
            placeholder="No property assigned"
          />
          <Select
            label="Status"
            name="status"
            value={form?.status || ""}
            onChange={(v) => updateField("status", v)}
            options={statusOptions.map((option) => ({ label: option.label, value: option.value }))}
          />
        </FormSection>

        <FormSection title="Backend Metadata">
          <Input
            label="Tenant ID"
            name="id"
            value={form?.id || ""}
            disabled
          />
          <Input
            label="User ID"
            name="user_id"
            value={form?.user_id || ""}
            disabled
          />
          <Input
            label="Created At"
            name="created_at"
            value={form?.created_at || ""}
            disabled
          />
          <Input
            label="Updated At"
            name="updated_at"
            value={form?.updated_at || ""}
            disabled
          />
        </FormSection>

        <FormActions onCancel={() => router.push("/tenants")} submitLabel="Save changes" loading={saving} />
      </form>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete tenant"
        message="This will permanently delete the tenant account. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
