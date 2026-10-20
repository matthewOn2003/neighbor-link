"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useRequest } from "@/hooks/useRequest";
import { useSelection } from "@/hooks/useSelection";
import { useLocale } from "@/i18n";
import { fds } from "@/utils/date";
import { Icon } from "@/components/ui/Icon";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog, useToast } from "@/components/ui";
import { accountDelete } from "@/services/staff/account";
import { RowActions, StatusPill, saveErrorMessage, useStatusOptions } from "@/components/staff/common";

export default function UsersPage() {
  const { t } = useLocale();
  const toast = useToast();
  const sel = useSelection();
  const statusOptions = useStatusOptions();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({
    keyword: "",
    username: "",
    department_id: "",
    position_id: "",
    status: "",
    hire_date_from: "",
    hire_date_to: "",
  });
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: departmentData } = useRequest("/staff-department/list", { per_page: 100 });
  const departments = departmentData?.list ?? [];
  const { data: positionData } = useRequest("/staff-position/list", { per_page: 100 });
  const positions = positionData?.list ?? [];

  const departmentOptions = [
    { value: "", label: t("all_departments") },
    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
  ];
  const positionOptions = [
    { value: "", label: t("all_positions") },
    ...positions.map((p) => ({ value: String(p.id), label: `${p.department_name} / ${p.name}` })),
  ];
  const filterStatusOptions = [{ value: "", label: t("all_statuses") }, ...statusOptions];
  const statusLabel = Object.fromEntries(statusOptions.map((option) => [option.value, option.label]));
  const departmentLabel = Object.fromEntries(departmentOptions.map((option) => [option.value, option.label]));
  const positionLabel = Object.fromEntries(positionOptions.map((option) => [option.value, option.label]));

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
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "keyword", label: t("search_keyword") },
            { key: "username", label: t("username") },
            { key: "department_id", label: t("department"), display: (value) => departmentLabel[value] ?? value },
            { key: "position_id", label: t("position"), display: (value) => positionLabel[value] ?? value },
            { key: "status", label: t("status"), display: (value) => statusLabel[value] ?? value },
            { key: "hire_date_from", label: t("hire_date_from") },
            { key: "hire_date_to", label: t("hire_date_to") },
          ]}
          onClearFilter={clear}
          title={t("users")}
          description={t("users_description")}
          summary={({ total }) => (
            <SummaryCard label={t("total_users")} value={total} icon="group" />
          )}
          emptyText={t("no_records")}
          filters={(
            <>
              <Input
                variant="filter"
                name="keyword"
                label={t("search_keyword")}
                value={draft.keyword}
                placeholder={t("search_staff_accounts")}
                onChange={(keyword) => setDraft((current) => ({ ...current, keyword }))}
              />

              <Input
                variant="filter"
                name="username"
                label={t("username")}
                value={draft.username}
                onChange={(username) => setDraft((current) => ({ ...current, username }))}
              />

              <Select
                variant="filter"
                name="department_id"
                label={t("department")}
                value={draft.department_id}
                onChange={(department_id) => setDraft((current) => ({ ...current, department_id }))}
                options={departmentOptions}
              />

              <Select
                variant="filter"
                name="position_id"
                label={t("position")}
                value={draft.position_id}
                onChange={(position_id) => setDraft((current) => ({ ...current, position_id }))}
                options={positionOptions}
              />

              <Select
                variant="filter"
                name="status"
                label={t("status")}
                value={draft.status}
                onChange={(status) => setDraft((current) => ({ ...current, status }))}
                options={filterStatusOptions}
              />

              <DatePicker
                variant="filter"
                name="hire_date_from"
                label={t("hire_date_from")}
                value={draft.hire_date_from}
                max={draft.hire_date_to || undefined}
                onChange={(hire_date_from) => setDraft((current) => ({ ...current, hire_date_from }))}
              />

              <DatePicker
                variant="filter"
                name="hire_date_to"
                label={t("hire_date_to")}
                value={draft.hire_date_to}
                min={draft.hire_date_from || undefined}
                onChange={(hire_date_to) => setDraft((current) => ({ ...current, hire_date_to }))}
              />
            </>
          )}
          resetFilters={reset}
          applyFilters={apply}
          buttons={(
            <Link className="btn btn-primary" href="/users/new">
              <Icon name="add" className="text-lg" />
              <span>{t("add_user")}</span>
            </Link>
          )}
          header={({ rows }) => (
            <tr className="bg-accent text-subtle font-semibold">
              <th className="sticky-left">
                <Checkbox
                  checked={sel.isAllSelected(rows)}
                  onChange={() => sel.toggleAll(rows)}
                />
              </th>
              <th>{t("account")}</th>
              <th>{t("name")}</th>
              <th>{t("contact_info")}</th>
              <th>{t("position")}</th>
              <th>{t("hire_date")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          )}
          body={({ rows, reload }) =>
            rows.map((user) => (
              <tr key={user.id} className="group">
                <td className="sticky-left">
                  <Checkbox
                    checked={sel.isSelected(user.id)}
                    onChange={() => sel.toggle(user.id)}
                  />
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-semibold text-scene-content">{user.username}</span>
                    {user.employee_no ? <span className="text-subtle text-xs">{user.employee_no}</span> : null}
                  </div>
                </td>
                <td className="text-scene-content">{user.name}</td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-scene-content">{user.email || "-"}</span>
                    <span className="text-subtle text-xs">{user.phone || "-"}</span>
                  </div>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-scene-content">{user.position_name || "-"}</span>
                    {user.department_name ? <span className="text-subtle text-xs">{user.department_name}</span> : null}
                  </div>
                </td>
                <td className="text-subtle">{fds(user.hire_date) || "-"}</td>
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
