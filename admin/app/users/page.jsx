"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { DataTable } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog, useToast } from "@/components/ui";
import { accountDelete } from "@/services/staff/account";
import { RowActions, StatusPill, saveErrorMessage } from "@/components/staff/common";

export default function UsersPage() {
  const { t } = useLocale();
  const toast = useToast();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({ keyword: "" });
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await accountDelete(pending.id);
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
          api="/staff-account/list"
          params={{ keyword: applied.keyword.trim() }}
          title={t("users")}
          description={t("users_description")}
          emptyText={t("no_records")}
          filters={(
            <Input variant="filter" name="keyword" label={t("search_keyword")} value={draft.keyword} onChange={(keyword) => setDraft((current) => ({ ...current, keyword }))} placeholder={t("search_staff_accounts")} />
          )}
          resetFilters={reset}
          applyFilters={apply}
          filterValues={draft}
          filterBadges={[{ key: "keyword", label: t("search_keyword") }]}
          onClearFilter={clear}
          buttons={(
            <Link className="btn btn-primary" href="/users/new">
              <Icon name="add" className="text-lg" />
              <span>{t("add_user")}</span>
            </Link>
          )}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              <th>{t("account")}</th>
              <th>{t("name")}</th>
              <th>{t("phone")}</th>
              <th>{t("email")}</th>
              <th>{t("position")}</th>
              <th>{t("department")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          )}
          body={({ rows, reload }) =>
            rows.map((user) => (
              <tr key={user.id}>
                <td className="font-semibold text-scene-content">{user.username}</td>
                <td className="text-scene-content">{user.name}</td>
                <td className="text-subtle">{user.phone || "-"}</td>
                <td className="text-subtle">{user.email || "-"}</td>
                <td className="text-scene-content">{user.position_name || "-"}</td>
                <td className="text-scene-content">{user.department_name || "-"}</td>
                <td>
                  <StatusPill status={user.status} />
                </td>
                <td>
                  <RowActions
                    editHref={`/users/${user.id}`}
                    editLabel={t("edit_user")}
                    onDelete={() => setPending({ id: user.id, name: user.name, reload })}
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
