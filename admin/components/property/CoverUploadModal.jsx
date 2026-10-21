"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { FileDropzone } from "@/components/ui/FileDropzone";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui";
import { useLocale } from "@/i18n";
import { uploadPropertyCover } from "@/services/property/cover";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** 选择并上传属性封面。上传成功后调用 onUploaded(updatedProperty)。 */
export function CoverUploadModal({ open, onClose, propertyId, onUploaded }) {
  const { t } = useLocale();
  const toast = useToast();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);
  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleClose() {
    if (saving) return;
    setFile(null);
    setError("");
    onClose?.();
  }

  function handleFile(next) {
    setError("");
    if (!ACCEPT_TYPES.includes(next.type)) {
      setFile(null);
      setError(t("cover_invalid_type"));
      return;
    }
    if (next.size > MAX_BYTES) {
      setFile(null);
      setError(t("cover_too_large"));
      return;
    }
    setFile(next);
  }

  async function handleSave() {
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const updated = await uploadPropertyCover(propertyId, file);
      toast.success(t("cover_uploaded"));
      setFile(null);
      onUploaded?.(updated);
      onClose?.();
    } catch (err) {
      const message = err?.code === "STORAGE_NOT_CONFIGURED"
        ? t("cover_storage_not_configured")
        : err?.message || t("cover_upload_failed");
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t("change_cover")}
      size="lg"
      footer={(
        <>
          <button type="button" className="btn btn-outline" onClick={handleClose} disabled={saving}>{t("cancel")}</button>
          <button type="button" className="btn btn-primary" onClick={handleSave} disabled={!file || saving}>
            {saving ? <><Spinner size="sm" label={t("saving")} /> {t("saving")}</> : t("save_cover")}
          </button>
        </>
      )}
    >
      <div className="space-y-4">
        {previewUrl ? (
          <div className="relative h-56 w-full overflow-hidden rounded-xl border border-line/40">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${previewUrl})` }} />
          </div>
        ) : null}
        <FileDropzone
          accept={ACCEPT_TYPES.join(",")}
          onFile={handleFile}
          disabled={saving}
          hint={t("cover_upload_hint")}
          fileName={file?.name}
        />
        {error ? <p className="text-sm text-error">{error}</p> : null}
      </div>
    </Modal>
  );
}
