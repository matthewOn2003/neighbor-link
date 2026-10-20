"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useDropdown } from "@/hooks/useDropdown";
import { useRequest } from "@/hooks/useRequest";
import { useSelection } from "@/hooks/useSelection";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { ConfirmDialog, useToast } from "@/components/ui";
import { positionDelete } from "@/services/staff/position";
import { RowActions, StatusPill, saveErrorMessage, useStatusOptions } from "@/components/staff/common";

export default function PositionsPage() {
  const { t } = useLocale();
  const toast = useToast();
  const sel = useSelection();
  const statusOptions = useStatusOptions();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({
    keyword: "",
    code: "",
    department_id: "",
    level: "",
    employment_type: "",
    status: "",
  });
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const { data: departmentData } = useRequest("/staff-department/list", { per_page: 100 });
  const departments = departmentData?.list ?? [];
  const { optionsOf, labelOf } = useDropdown(["position_level", "employment_type"]);

  const departmentOptions = [
    { value: "", label: t("all_departments") },
    ...departments.map((d) => ({ value: String(d.id), label: d.name })),
  ];
  const levelOptions = [{ value: "", label: t("all_levels") }, ...optionsOf("position_level")];
  const employmentOptions = [
    { value: "", label: t("all_employment_types") },
    ...optionsOf("employment_type"),
  ];
  const filterStatusOptions = [{ value: "", label: t("all_statuses") }, ...statusOptions];
  const statusLabel = Object.fromEntries(statusOptions.map((option) => [option.value, option.label]));
  const departmentLabel = Object.fromEntries(departmentOptions.map((option) => [option.value, option.label]));

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
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "keyword", label: t("search_keyword") },
            { key: "code", label: t("code") },
            { key: "department_id", label: t("department"), display: (value) => departmentLabel[value] ?? value },
            { key: "level", label: t("level"), display: (value) => labelOf("position_level", value) },
            { key: "employment_type", label: t("employment_type"), display: (value) => labelOf("employment_type", value) },
            { key: "status", label: t("status"), display: (value) => statusLabel[value] ?? value },
          ]}
          onClearFilter={clear}
          title={t("positions")}
          description={t("positions_description")}
          summary={({ total }) => (
            <SummaryCard label={t("total_positions")} value={total} icon="badge" />
          )}
          emptyText={t("no_records")}
          filters={(
            <>
              <Input
                variant="filter"
                name="keyword"
                label={t("search_keyword")}
                value={draft.keyword}
                placeholder={t("search_positions")}
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
                name="department_id"
                label={t("department")}
                value={draft.department_id}
                onChange={(department_id) => setDraft((current) => ({ ...current, department_id }))}
                options={departmentOptions}
              />

              <Select
                variant="filter"
                name="level"
                label={t("level")}
                value={draft.level}
                onChange={(level) => setDraft((current) => ({ ...current, level }))}
                options={levelOptions}
              />

              <Select
                variant="filter"
                name="employment_type"
                label={t("employment_type")}
                value={draft.employment_type}
                onChange={(employment_type) => setDraft((current) => ({ ...current, employment_type }))}
                options={employmentOptions}
              />

              <Select
                variant="filter"
                name="status"
                label={t("status")}
                value={draft.status}
                onChange={(status) => setDraft((current) => ({ ...current, status }))}
                options={filterStatusOptions}
              />
            </>
          )}
          resetFilters={reset}
          applyFilters={apply}
          buttons={(
            <Link className="btn btn-primary" href="/positions/new">
              <Icon name="add" className="text-lg" />
              <span>{t("add_position")}</span>
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
              <th>{t("position_name")}</th>
              <th>{t("code")}</th>
              <th>{t("department")}</th>
              <th>{t("level")}</th>
              <th>{t("employment_type")}</th>
              <th>{t("headcount")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          )}
          body={({ rows, reload }) =>
            rows.map((position) => (
              <tr key={position.id} className="group">
                <td className="sticky-left">
                  <Checkbox
                    checked={sel.isSelected(position.id)}
                    onChange={() => sel.toggle(position.id)}
                  />
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-semibold text-scene-content">{position.name}</span>
                    {position.description ? (
                      <span className="text-subtle text-xs">{position.description}</span>
                    ) : null}
                  </div>
                </td>
                <td className="text-scene-content">{position.code}</td>
                <td className="text-scene-content">{position.department_name || "-"}</td>
                <td>
                  <span className="text-scene-content">{labelOf("position_level", position.level)}</span>
                </td>
                <td>
                  <span className="text-subtle">{labelOf("employment_type", position.employment_type)}</span>
                </td>
                <td className="text-scene-content">{position.headcount}</td>
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
