"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { useDictionary } from "@/lib/useDictionary";
import {
  PageHeader,
  Breadcrumb,
  FormSection,
  FormActions,
  ConfirmDialog,
  Select,
  Textarea,
  Input,
  useToast,
} from "@/app/components/ui";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const request = useApi();
  const toast = useToast();
  const { options: statusOptions } = useDictionary("property_status");

  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    request(`/property/detail/${id}`, undefined, { method: "GET" })
      .then((res) => {
        setForm(res.data);
      })
      .catch(() => {
        toast.error("Failed to load property");
      })
      .finally(() => {
        setLoading(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    if (!form.address || !form.address.trim()) {
      nextErrors.address = "Address is required";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    try {
      await request(`/property/update/${id}`, form);
      toast.success("Property updated");
    } catch {
      toast.error("Failed to update property");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      await request(`/property/delete/${id}`, undefined, { method: "POST" });
      toast.success("Property deleted");
      router.push("/properties");
    } catch {
      toast.error("Failed to delete property");
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
          { label: "Properties", href: "/properties" },
          { label: form?.name || `#${id}` },
        ]}
      />
      <PageHeader
        title={form?.name || `Property #${id}`}
        description="View and edit property details."
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
            label="Address"
            name="address"
            value={form?.address || ""}
            onChange={(v) => updateField("address", v)}
            required
            error={errors.address}
          />
          <Select
            label="Status"
            name="status"
            value={form?.status || ""}
            onChange={(v) => updateField("status", v)}
            options={statusOptions.map((option) => ({ label: option.label, value: option.value }))}
          />
          <Input
            label="WiFi SSID"
            name="wifi_ssid"
            value={form?.wifi_ssid || ""}
            onChange={(v) => updateField("wifi_ssid", v)}
          />
          <Input
            label="WiFi Password"
            name="wifi_password"
            value={form?.wifi_password || ""}
            onChange={(v) => updateField("wifi_password", v)}
          />
          <Textarea
            label="Notes"
            name="notes"
            value={form?.notes || ""}
            onChange={(v) => updateField("notes", v)}
          />
        </FormSection>

        <FormSection title="Backend Metadata">
          <Input
            label="Property ID"
            name="id"
            value={form?.id || ""}
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

        <FormActions onCancel={() => router.push("/properties")} submitLabel="Save changes" loading={saving} />
      </form>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete property"
        message="This will permanently delete the property. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
