"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useLocale } from "@/i18n";
import { Icon, DataTable, SummaryCard, Input, Select, DatePicker, ConfirmDialog, useToast, StatusBadge } from "@/components/ui";
import { fdl } from "@/utils/date";
import { RowActions, useStatusOptions } from "@/components/staff/common";
import { apiErrorMessage } from "@/utils/errors";
import { labelMap } from "@/utils/collections";
import { request } from "@/utils/request";

export default function DepartmentsPage() {
  const { t } = useLocale();
  const toast = useToast();
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
  const [submitting, setSubmitting] = useState(false);

  const filterStatusOptions = [{ value: "", label: t("all_statuses") }, ...statusOptions];
  const statusLabel = labelMap(statusOptions);

  async function confirmDelete() {
    setSubmitting(true);
    try {
      await request("/staff-department/delete", { id: pending.id });
      toast.success(t("record_deleted"));
      pending.reload();
    } catch (err) {
      toast.error(apiErrorMessage(err, t, { fallbackKey: "delete_failed" }));
    } finally {
      setSubmitting(false);
      setPending(null);
    }
  }

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api={"/staff-department/list"}
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
          exportConfig={{
            filename: "departments",
            columns: [
              { label: t("department_name"), get: (r) => r.name },
              { label: t("code"), get: (r) => r.code },
              { label: t("manager_name"), get: (r) => r.manager_name },
              { label: t("phone"), get: (r) => r.phone },
              { label: t("location"), get: (r) => r.location },
              { label: t("description"), get: (r) => r.description },
              { label: t("headcount"), get: (r) => r.headcount },
              { label: t("status"), get: (r) => statusLabel[r.status] ?? r.status },
              { label: t("created_at"), get: (r) => fdl(r.created_at) },
              { label: t("updated_at"), get: (r) => fdl(r.updated_at) },
            ],
          }}
          importConfig={{
            title: t("import_departments"),
            sampleName: "departments-import-template",
            columns: [
              { key: "name", label: t("department_name"), required: true, sample: "Operations" },
              { key: "code", label: t("code"), required: true, sample: "OPS" },
              { key: "manager_name", label: t("manager_name"), sample: "Alice Tan" },
              { key: "phone", label: t("phone"), sample: "03-12345678" },
              { key: "location", label: t("location"), sample: "Kuala Lumpur" },
              { key: "description", label: t("description"), sample: "" },
              { key: "status", label: t("status"), sample: "active" },
            ],
            onRow: (values) => request("/staff-department/create", { ...values, status: values.status || "active" }),
          }}
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
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
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
                  <StatusBadge value={department.status} options={statusOptions} />
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
        loading={submitting}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </main>
  );
}
