"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog, useToast } from "@/components/ui";
import { departmentDelete } from "@/services/staff/department";
import { RowActions, StatusPill, saveErrorMessage } from "@/components/staff/common";

export default function DepartmentsPage() {
  const { t } = useLocale();
  const toast = useToast();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({ keyword: "" });
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await departmentDelete(pending.id);
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
          api="/staff-department/list"
          params={{ keyword: applied.keyword.trim() }}
          title={t("departments")}
          description={t("departments_description")}
          emptyText={t("no_records")}
          filters={(
            <Input variant="filter" name="keyword" label={t("search_keyword")} value={draft.keyword} onChange={(keyword) => setDraft((current) => ({ ...current, keyword }))} placeholder={t("search_departments")} />
          )}
          resetFilters={reset}
          applyFilters={apply}
          filterValues={draft}
          filterBadges={[{ key: "keyword", label: t("search_keyword") }]}
          onClearFilter={clear}
          buttons={(
            <Link className="btn btn-primary" href="/departments/new">
              <Icon name="add" className="text-lg" />
              <span>{t("add_department")}</span>
            </Link>
          )}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              <th>{t("department_name")}</th>
              <th>{t("code")}</th>
              <th>{t("description")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          )}
          body={({ rows, reload }) =>
            rows.map((department) => (
              <tr key={department.id}>
                <td className="font-semibold text-scene-content">{department.name}</td>
                <td className="text-scene-content">{department.code}</td>
                <td className="text-subtle">{department.description || "-"}</td>
                <td>
                  <StatusPill status={department.status} />
                </td>
                <td>
                  <RowActions
                    editHref={`/departments/${department.id}`}
                    editLabel={t("edit_department")}
                    onDelete={() => setPending({ id: department.id, name: department.name, reload })}
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
