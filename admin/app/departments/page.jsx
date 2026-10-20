"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useSelection } from "@/hooks/useSelection";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { DatePicker } from "@/components/ui/DatePicker";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog, useToast } from "@/components/ui";
import { departmentDelete } from "@/services/staff/department";
import { RowActions, StatusPill, saveErrorMessage, useStatusOptions } from "@/components/staff/common";

export default function DepartmentsPage() {
  const { t } = useLocale();
  const toast = useToast();
  const sel = useSelection();
  const statusOptions = useStatusOptions();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({
    keyword: "",
    code: "",
    status: "",
    location: "",
    manager_name: "",
    created_from: "",
    created_to: "",
  });
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filterStatusOptions = [{ value: "", label: t("all_statuses") }, ...statusOptions];
  const statusLabel = Object.fromEntries(statusOptions.map((option) => [option.value, option.label]));

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
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "keyword", label: t("search_keyword") },
            { key: "code", label: t("code") },
            { key: "status", label: t("status"), display: (value) => statusLabel[value] ?? value },
            { key: "location", label: t("location") },
            { key: "manager_name", label: t("manager_name") },
            { key: "created_from", label: t("created_from") },
            { key: "created_to", label: t("created_to") },
          ]}
          onClearFilter={clear}
          title={t("departments")}
          description={t("departments_description")}
          summary={({ total }) => (
            <SummaryCard label={t("total_departments")} value={total} icon="apartment" />
          )}
          emptyText={t("no_records")}
          filters={(
            <>
              <Input
                variant="filter"
                name="keyword"
                label={t("search_keyword")}
                value={draft.keyword}
                placeholder={t("search_departments")}
                onChange={(keyword) => setDraft((current) => ({ ...current, keyword }))}
              />

              <Input
                variant="filter"
                name="code"
                label={t("code")}
                value={draft.code}
                onChange={(code) => setDraft((current) => ({ ...current, code }))}
              />

              <Select
                variant="filter"
                name="status"
                label={t("status")}
                value={draft.status}
                onChange={(status) => setDraft((current) => ({ ...current, status }))}
                options={filterStatusOptions}
              />

              <Input
                variant="filter"
                name="location"
                label={t("location")}
                value={draft.location}
                onChange={(location) => setDraft((current) => ({ ...current, location }))}
              />

              <Input
                variant="filter"
                name="manager_name"
                label={t("manager_name")}
                value={draft.manager_name}
                onChange={(manager_name) => setDraft((current) => ({ ...current, manager_name }))}
              />

              <DatePicker
                variant="filter"
                name="created_from"
                label={t("created_from")}
                value={draft.created_from}
                max={draft.created_to || undefined}
                onChange={(created_from) => setDraft((current) => ({ ...current, created_from }))}
              />

              <DatePicker
                variant="filter"
                name="created_to"
                label={t("created_to")}
                value={draft.created_to}
                min={draft.created_from || undefined}
                onChange={(created_to) => setDraft((current) => ({ ...current, created_to }))}
              />
            </>
          )}
          resetFilters={reset}
          applyFilters={apply}
          buttons={(
            <Link className="btn btn-primary" href="/departments/new">
              <Icon name="add" className="text-lg" />
              <span>{t("add_department")}</span>
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
              <th>{t("department_name")}</th>
              <th>{t("code")}</th>
              <th>{t("manager_name")}</th>
              <th>{t("location")}</th>
              <th>{t("headcount")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          )}
          body={({ rows, reload }) =>
            rows.map((department) => (
              <tr key={department.id} className="group">
                <td className="sticky-left">
                  <Checkbox
                    checked={sel.isSelected(department.id)}
                    onChange={() => sel.toggle(department.id)}
                  />
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-semibold text-scene-content">{department.name}</span>
                    {department.description ? (
                      <span className="text-subtle text-xs">{department.description}</span>
                    ) : null}
                  </div>
                </td>
                <td className="text-scene-content">{department.code}</td>
                <td className="text-scene-content">
                  <div className="flex flex-col">
                    <span>{department.manager_name || "-"}</span>
                    {department.phone ? <span className="text-subtle text-xs">{department.phone}</span> : null}
                  </div>
                </td>
                <td className="text-subtle">{department.location || "-"}</td>
                <td className="text-scene-content">{department.headcount}</td>
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
