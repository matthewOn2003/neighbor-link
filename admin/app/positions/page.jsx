"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useDropdown } from "@/hooks/useDropdown";
import { useRequest } from "@/hooks/useRequest";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ConfirmDialog, useToast } from "@/components/ui";
import { positionCreate, positionDelete } from "@/services/staff/position";
import { fdl } from "@/utils/date";
import { fetchAllRows } from "@/utils/excel";
import { RowActions, StatusPill, saveErrorMessage, useStatusOptions } from "@/components/staff/common";

export default function PositionsPage() {
  const { t } = useLocale();
  const toast = useToast();
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
          exportConfig={{
            filename: "positions",
            columns: [
              { label: t("position_name"), get: (r) => r.name },
              { label: t("code"), get: (r) => r.code },
              { label: t("department"), get: (r) => r.department_name },
              { label: t("level"), get: (r) => labelOf("position_level", r.level) },
              { label: t("employment_type"), get: (r) => labelOf("employment_type", r.employment_type) },
              { label: t("description"), get: (r) => r.description },
              { label: t("headcount"), get: (r) => r.headcount },
              { label: t("status"), get: (r) => statusLabel[r.status] ?? r.status },
              { label: t("created_at"), get: (r) => fdl(r.created_at) },
              { label: t("updated_at"), get: (r) => fdl(r.updated_at) },
            ],
          }}
          importConfig={{
            title: t("import_positions"),
            sampleName: "positions-import-template",
            columns: [
              { key: "department", label: t("department"), required: true, sample: "Operations" },
              { key: "name", label: t("position_name"), required: true, sample: "Property Officer" },
              { key: "code", label: t("code"), required: true, sample: "PROP_OFFICER" },
              { key: "level", label: t("level"), sample: "staff" },
              { key: "employment_type", label: t("employment_type"), sample: "full_time" },
              { key: "description", label: t("description"), sample: "" },
              { key: "status", label: t("status"), sample: "active" },
            ],
            onRow: async (values) => {
              const all = await fetchAllRows("/staff-department/list", {});
              const department = all.find((d) => d.name.toLowerCase() === values.department.toLowerCase());
              if (!department) throw new Error(t("import_department_not_found", { name: values.department }));
              return positionCreate({
                department_id: department.id,
                name: values.name,
                code: values.code,
                level: values.level || "staff",
                employment_type: values.employment_type || "full_time",
                description: values.description,
                status: values.status || "active",
                permission_ids: [],
              });
            },
          }}
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
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
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
