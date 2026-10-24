"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { useDropdown } from "@/hooks/useDropdown";
import { request, uploadFile } from "@/hooks/useApiRequest";
import { api } from "@/services/api";
import { Input, Select } from "@/components/ui";

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
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
  const [photos, setPhotos] = useState([]);
  const photoInput = useRef(null);

  const slug = kind === "maintenance" ? "maintenance_category" : "complaint_category";
  const categories = dict.optionsOf(slug);
  // Tenants can choose low, normal or high; urgent is reserved for the office.
  const priorities = dict.optionsOf("maintenance_priority").filter((o) => o.value !== "urgent");
  const selectedCategory = categories.some((o) => o.value === category) ? category : (categories[0]?.value ?? "");
  const selectedPriority = priorities.some((o) => o.value === priority) ? priority : (priorities[0]?.value ?? "");

  function addPhotos(event) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError("");
    for (const file of picked) {
      if (!PHOTO_TYPES.includes(file.type)) return setError(t("portal_photo_type"));
      if (file.size > MAX_PHOTO_BYTES) return setError(t("portal_photo_too_large"));
    }
    if (photos.length + picked.length > MAX_PHOTOS) return setError(t("portal_photo_limit_reached"));
    setPhotos((current) => [...current, ...picked]);
  }

  function removePhoto(index) {
    setPhotos((current) => current.filter((_, i) => i !== index));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!title.trim()) return setError(t("portal_title_required"));
    if (!selectedCategory) return setError(t("portal_no_categories"));

    setSubmitting(true);
    try {
      if (kind === "maintenance") {
        await uploadFile(api.maintenance.create, photos, {
          fieldName: "files",
          fields: {
            title: title.trim(),
            description: description.trim(),
            category: selectedCategory,
            priority: selectedPriority,
          },
        });
      } else {
        await request(api.complaint.create, { title: title.trim(), description: description.trim(), category: selectedCategory });
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
          <Input
            name="title"
            hideLabel
            placeholder={t("portal_subject_placeholder")}
            value={title}
            onChange={setTitle}
          />
        </Field>
        <div className="grid grid-cols-2 gap-2.5">
          <Field label={t("category")}>
            <Select
              name="category"
              label={t("category")}
              value={selectedCategory}
              onChange={setCategory}
              options={categories.map((o) => ({
                value: o.value,
                label: optionLabel(slug, o),
              }))}
            />
          </Field>
          {kind === "maintenance" ? (
            <Field label={t("priority")}>
              <Select
                name="priority"
                label={t("priority")}
                value={selectedPriority}
                onChange={setPriority}
                options={priorities.map((o) => ({
                  value: o.value,
                  label: optionLabel("maintenance_priority", o),
                }))}
              />
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
        {kind === "maintenance" ? (
          <Field label={t("portal_attachments")} hint={t("portal_photo_hint")}>
            <input
              ref={photoInput}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={addPhotos}
            />
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              className="flex w-full flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.02] p-4 text-center"
            >
              <Icon name="add_a_photo" className="text-[28px] text-primary" />
              <span className="text-xs font-semibold text-on-surface">{t("portal_add_photos")}</span>
            </button>
            {photos.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1.5">
                {photos.map((file, index) => (
                  <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-black/30 px-3 py-2">
                    <span className="truncate text-xs text-on-surface">{file.name}</span>
                    <button
                      type="button"
                      aria-label={t("portal_photo_remove")}
                      onClick={() => removePhoto(index)}
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-on-surface-variant hover:bg-white/[0.06]"
                    >
                      <Icon name="close" className="text-[16px]" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </Field>
        ) : null}
        {error ? <p className="rounded-xl border border-rose-500/25 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">{error}</p> : null}
      </form>
    </Sheet>
  );
}
