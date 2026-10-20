"use client";

import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useLocale } from "@/i18n";

export function useStatusOptions() {
  const { t } = useLocale();
  return [
    { value: "active", label: t("active") },
    { value: "inactive", label: t("inactive") },
  ];
}

export function StatusPill({ status }) {
  const { t } = useLocale();
  const active = status === "active";
  return (
    <span className={`status-pill ${active ? "success" : "neutral"}`}>
      {t(active ? "active" : "inactive")}
    </span>
  );
}

export function RowActions({ editHref, editLabel, onDelete }) {
  const { t } = useLocale();
  return (
    <div className="flex justify-center items-center gap-2">
      <Link className="btn btn-primary !p-0 size-10 grid place-items-center" href={editHref} aria-label={editLabel}>
        <Icon name="edit" className="text-lg" />
      </Link>
      <button
        type="button"
        className="btn btn-outline !p-0 size-10 grid place-items-center text-error"
        aria-label={t("delete")}
        onClick={onDelete}
      >
        <Icon name="delete" className="text-lg" />
      </button>
    </div>
  );
}

export function RecordFallback({ loading, found, children }) {
  const { t } = useLocale();
  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }
  if (!found) {
    return <p className="p-12 text-center text-sm text-subtle">{t("record_not_found")}</p>;
  }
  return children;
}

// 后端返回的业务错误码映射为对应的提示文字
export function saveErrorMessage(err, t, fallbackKey) {
  if (err?.code === "DUPLICATE") return t("duplicate_record");
  if (err?.code === "IN_USE") return t("record_in_use");
  return err?.message || t(fallbackKey);
}
