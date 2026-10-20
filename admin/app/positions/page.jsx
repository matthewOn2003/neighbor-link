"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog, useToast } from "@/components/ui";
import { positionDelete } from "@/services/staff/position";
import { RowActions, StatusPill, saveErrorMessage } from "@/components/staff/common";

export default function PositionsPage() {
  const { t } = useLocale();
  const toast = useToast();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({ keyword: "" });
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await positionDelete(pending.id);
      toast.success(t("record_deleted"));
      pending.reload();
    } catch (err) {
      toast.error(saveErrorMessage(err, t, "delete_failed"));
    } finally {
      setDeleting(false);
      setPending(null);
    }
  }

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api="/staff-position/list"
          params={{ keyword: applied.keyword.trim() }}
          title={t("positions")}
          description={t("positions_description")}
          emptyText={t("no_records")}
          filters={(
            <Input variant="filter" name="keyword" label={t("search_keyword")} value={draft.keyword} onChange={(keyword) => setDraft((current) => ({ ...current, keyword }))} placeholder={t("search_positions")} />
          )}
          resetFilters={reset}
          applyFilters={apply}
          filterValues={draft}
          filterBadges={[{ key: "keyword", label: t("search_keyword") }]}
          onClearFilter={clear}
          buttons={(
            <Link className="btn btn-primary" href="/positions/new">
              <Icon name="add" className="text-lg" />
              <span>{t("add_position")}</span>
            </Link>
          )}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              <th>{t("position_name")}</th>
              <th>{t("code")}</th>
              <th>{t("department")}</th>
              <th>{t("description")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          )}
          body={({ rows, reload }) =>
            rows.map((position) => (
              <tr key={position.id}>
                <td className="font-semibold text-scene-content">{position.name}</td>
                <td className="text-scene-content">{position.code}</td>
                <td className="text-scene-content">{position.department_name || "-"}</td>
                <td className="text-subtle">{position.description || "-"}</td>
                <td>
                  <StatusPill status={position.status} />
                </td>
                <td>
                  <RowActions
                    editHref={`/positions/${position.id}`}
                    editLabel={t("edit_position")}
                    onDelete={() => setPending({ id: position.id, name: position.name, reload })}
                  />
                </td>
              </tr>
            ))
          }
        />
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        title={t("delete")}
        message={t("confirm_delete")}
        danger
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </main>
  );
}
