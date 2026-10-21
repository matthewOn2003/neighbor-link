"use client";

import { useState } from "react";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useDropdown } from "@/hooks/useDropdown";
import { maintenanceCreate } from "@/services/tenant-portal/maintenance";
import { complaintCreate } from "@/services/tenant-portal/complaint";
import { useOptionLabel, useTOr } from "./status";
import { Field, GhostButton, PrimaryButton, SegmentedTabs, Sheet, inputClass } from "./primitives";

/** Create a repair request or a complaint. Options come from the backend dictionary. */
export default function NewRequestSheet({ initialKind = "maintenance", onClose, onCreated }) {
  const { t } = useLocale();
  const tOr = useTOr();
  const optionLabel = useOptionLabel();
  const toast = useToast();
  const dict = useDropdown(["maintenance_category", "maintenance_priority", "complaint_category"]);

  const [kind, setKind] = useState(initialKind);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("normal");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const slug = kind === "maintenance" ? "maintenance_category" : "complaint_category";
  const categories = dict.optionsOf(slug);
  // Tenants can choose low, normal or high; urgent is reserved for the office.
  const priorities = dict.optionsOf("maintenance_priority").filter((o) => o.value !== "urgent");
  const selectedCategory = categories.some((o) => o.value === category) ? category : (categories[0]?.value ?? "");
  const selectedPriority = priorities.some((o) => o.value === priority) ? priority : (priorities[0]?.value ?? "");

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!title.trim()) return setError(t("portal_title_required"));
    if (!selectedCategory) return setError(t("portal_no_categories"));

    setSubmitting(true);
    try {
      if (kind === "maintenance") {
        await maintenanceCreate({ title: title.trim(), description: description.trim(), category: selectedCategory, priority: selectedPriority });
      } else {
        await complaintCreate({ title: title.trim(), description: description.trim(), category: selectedCategory });
      }
      toast.show(t(kind === "maintenance" ? "portal_request_submitted" : "portal_complaint_submitted"), "success");
      onCreated(kind);
    } catch (err) {
      setError(tOr(`portal_request_error_${err.code}`, err.message || t("portal_request_failed")));
    } finally {
      setSubmitting(false);
    }
  }

  const footer = (
    <>
      <GhostButton onClick={onClose}>{t("cancel")}</GhostButton>
      <PrimaryButton type="submit" form="new-request-form" disabled={submitting}>
        <Icon name="send" className="text-[18px]" />
        {submitting ? t("portal_submitting") : t("submit_request")}
      </PrimaryButton>
    </>
  );

  return (
    <Sheet
      open
      onClose={onClose}
      icon={kind === "maintenance" ? "build" : "campaign"}
      title={t(kind === "maintenance" ? "new_maintenance_request" : "new_complaint")}
      subtitle={t("portal_new_request_hint")}
      footer={footer}
    >
      <div className="mb-4">
        <SegmentedTabs
          value={kind}
          onChange={(next) => {
            setKind(next);
            setCategory("");
          }}
          items={[
            { key: "maintenance", label: t("portal_repair"), icon: "build" },
            { key: "complaint", label: t("portal_complaint"), icon: "campaign" },
          ]}
        />
      </div>
      <form id="new-request-form" onSubmit={submit} className="flex flex-col gap-3.5">
        <Field label={t("portal_subject")}>
          <input
            className={inputClass}
            maxLength={200}
            placeholder={t("portal_subject_placeholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label={t("category")}>
            <select className={inputClass} value={selectedCategory} onChange={(e) => setCategory(e.target.value)}>
              {categories.map((o) => (
                <option key={o.value} value={o.value}>
                  {optionLabel(slug, o)}
                </option>
              ))}
            </select>
          </Field>
          {kind === "maintenance" ? (
            <Field label={t("priority")}>
              <select className={inputClass} value={selectedPriority} onChange={(e) => setPriority(e.target.value)}>
                {priorities.map((o) => (
                  <option key={o.value} value={o.value}>
                    {optionLabel("maintenance_priority", o)}
                  </option>
                ))}
              </select>
            </Field>
          ) : null}
        </div>
        <Field label={t("portal_description_access")}>
          <textarea
            className={`${inputClass} min-h-28 resize-none`}
            maxLength={2000}
            placeholder={t("portal_description_placeholder")}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        {error ? <p className="rounded-xl border border-rose-500/25 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">{error}</p> : null}
      </form>
    </Sheet>
  );
}
