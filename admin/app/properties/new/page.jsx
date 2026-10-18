"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequest } from "@/hooks/useRequest";
import { FormPage, FormSection, Select, Textarea, Input, useToast } from "@/app/components/ui";

const EMPTY_FORM = { name: "", address: "", wifi_ssid: "", wifi_password: "", status: "", notes: "" };

export default function NewPropertyPage() {
  const router = useRouter();
  const request = useRequest();
  const toast = useToast();
  const { data: options } = useRequest("/dictionary/options", { slug: "property_status" });

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  function updateField(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.name || !form.name.trim()) nextErrors.name = "Name is required";
    if (!form.address || !form.address.trim()) nextErrors.address = "Address is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    try {
      const res = await request("/property/create", form);
      toast.success("Property created");
      router.push(`/properties/${res.data.id}`);
    } catch {
      toast.error("Failed to create property");
      setSaving(false);
    }
  }

  return (
    <FormPage
      title="New property"
      subtitle="Add a new property to the portfolio."
      backLabel="Properties"
      backHref="/properties"
      onSubmit={handleSubmit}
      actions={
        <div className="flex gap-3">
          <button type="button" className="btn btn-secondary" onClick={() => router.push("/properties")} disabled={saving}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Create property"}
          </button>
        </div>
      }
      size="md"
    >
      <FormSection title="Details">
        <Input label="Name" name="name" value={form.name} onChange={(v) => updateField("name", v)} required error={errors.name} />
        <Input label="Address" name="address" value={form.address} onChange={(v) => updateField("address", v)} required error={errors.address} />
        <Select
          label="Status"
          name="status"
          value={form.status}
          onChange={(v) => updateField("status", v)}
          options={options?.map((o) => ({ label: o.label, value: o.value }))}
        />
        <Input label="WiFi SSID" name="wifi_ssid" value={form.wifi_ssid} onChange={(v) => updateField("wifi_ssid", v)} />
        <Input label="WiFi Password" name="wifi_password" value={form.wifi_password} onChange={(v) => updateField("wifi_password", v)} />
        <Textarea label="Notes" name="notes" value={form.notes} onChange={(v) => updateField("notes", v)} />
      </FormSection>
    </FormPage>
  );
}