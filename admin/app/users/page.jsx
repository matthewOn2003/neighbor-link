"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useApiRequest, request } from "@/hooks/useApiRequest";
import { useLocale } from "@/i18n";
import { Icon, DataTable, SummaryCard, Input, Select, DatePicker, ConfirmDialog, useToast, StatusBadge } from "@/components/ui";
import { fdl, fds } from "@/utils/date";
import { fetchAllRows } from "@/utils/excel";
import { RowActions, useStatusOptions } from "@/components/staff/common";
import { apiErrorMessage } from "@/utils/errors";
import { labelMap } from "@/utils/collections";
import { api } from "@/services/api";

export default function UsersPage() {
  const { t } = useLocale();
  const toast = useToast();
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
  const [submitting, setSubmitting] = useState(false);

  const { data: departmentData } = useApiRequest(api.staffDepartment.list, { per_page: 100 });
  const departments = departmentData?.list ?? [];
  const { data: positionData } = useApiRequest(api.staffPosition.list, { per_page: 100 });
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
  const statusLabel = labelMap(statusOptions);
  const departmentLabel = labelMap(departmentOptions);
  const positionLabel = labelMap(positionOptions);

  async function confirmDelete() {
    setSubmitting(true);
    try {
      await request(api.staffAccount.delete, { id: pending.id });
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
          api={api.staffAccount.list}
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
          exportConfig={{
            filename: "staff-accounts",
            columns: [
              { label: t("username"), get: (r) => r.username },
              { label: t("name"), get: (r) => r.name },
              { label: t("employee_no"), get: (r) => r.employee_no },
              { label: t("email"), get: (r) => r.email },
              { label: t("phone"), get: (r) => r.phone },
              { label: t("position"), get: (r) => r.position_name },
              { label: t("department"), get: (r) => r.department_name },
              { label: t("hire_date"), get: (r) => fds(r.hire_date) },
              { label: t("status"), get: (r) => statusLabel[r.status] ?? r.status },
              { label: t("created_at"), get: (r) => fdl(r.created_at) },
              { label: t("updated_at"), get: (r) => fdl(r.updated_at) },
            ],
          }}
          importConfig={{
            title: t("import_users"),
            sampleName: "staff-accounts-import-template",
            columns: [
              { key: "username", label: t("username"), required: true, sample: "jsmith" },
              { key: "password", label: t("password"), required: true, sample: "ChangeMe123!" },
              { key: "name", label: t("name"), required: true, sample: "John Smith" },
              { key: "position_code", label: t("position_code"), required: true, sample: "PROP_OFFICER" },
              { key: "employee_no", label: t("employee_no"), sample: "E0001" },
              { key: "hire_date", label: t("hire_date"), sample: "2026-01-15" },
              { key: "email", label: t("email"), sample: "jsmith@example.com" },
              { key: "phone", label: t("phone"), sample: "012-3456789" },
              { key: "status", label: t("status"), sample: "active" },
            ],
            onRow: async (values) => {
              const all = await fetchAllRows(api.staffPosition.list, {});
              const position = all.find((p) => p.code.toLowerCase() === values.position_code.toLowerCase());
              if (!position) throw new Error(t("import_position_not_found", { code: values.position_code }));
              return request(api.staffAccount.create, {
                username: values.username,
                password: values.password,
                name: values.name,
                phone: values.phone,
                email: values.email,
                employee_no: values.employee_no,
                hire_date: values.hire_date,
                position_id: position.id,
                status: values.status || "active",
              });
            },
          }}
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
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
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
                  <StatusBadge value={user.status} options={statusOptions} />
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
        loading={submitting}
        onConfirm={confirmDelete}
        onCancel={() => setPending(null)}
      />
    </main>
  );
}
