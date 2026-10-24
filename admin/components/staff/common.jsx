"use client";

import { Link } from "@/i18n/navigation";
import { EmptyState, Icon, Spinner } from "@/components/ui";
import { useDropdown } from "@/hooks/useDropdown";
import { useLocale } from "@/i18n";

export function useStatusOptions() {
  return useDropdown(["staff_status"]).optionsOf("staff_status");
}

export function RowActions({ editHref, editLabel, onDelete }) {
  const { t } = useLocale();
  return (
    <div className="flex justify-center items-center gap-2">
      <Link className="btn btn-primary btn-icon" href={editHref} aria-label={editLabel}>
        <Icon name="edit" className="text-lg" />
      </Link>
      <button
        type="button"
        className="btn btn-outline btn-icon text-error"
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
    return <EmptyState title={t("record_not_found")} />;
  }
  return children;
}

// 后端返回的业务错误码映射为对应的提示文字
