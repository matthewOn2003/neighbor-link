"use client";

import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useDropdown } from "@/hooks/useDropdown";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useLocale } from "@/i18n";
import { request } from "@/services/request";
import { Icon, DataTable, SummaryCard, Input, Select, DatePicker, StatusBadge } from "@/components/ui";
import { fetchAllRows } from "@/utils/excel";
import { fdl } from "@/utils/date";
import { indexBy } from "@/utils/collections";
import { api } from "@/services/api";

export default function MaintenancePage() {
  const { t } = useLocale();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({
    keyword: "",
    status: "",
    priority: "",
    category: "",
    property_id: "",
    created_from: "",
    created_to: "",
  });
  const update = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));

  const { optionsOf } = useDropdown(["maintenance_category", "maintenance_priority", "maintenance_status"]);
  const categoryItems = optionsOf("maintenance_category");
  const priorityItems = optionsOf("maintenance_priority");
  const statusItems = optionsOf("maintenance_status");
  const categoryMap = indexBy(categoryItems);
  const priorityMap = indexBy(priorityItems);
  const statusMap = indexBy(statusItems);
  const categoryOptions = [{ value: "", label: t("all_categories") }, ...categoryItems];
  const priorityOptions = [{ value: "", label: t("all_priorities") }, ...priorityItems];
  const statusOptions = [{ value: "", label: t("all_statuses") }, ...statusItems];

  const { data: propertyData } = useApiRequest(api.property.list, { per_page: 100 });
  const propertyOptions = [
    { value: "", label: t("all_properties") },
    ...(propertyData?.list ?? []).map((property) => ({ value: String(property.id), label: property.name })),
  ];
  const labelFor = (options, value) => options.find((option) => option.value === value)?.label ?? value;

  // 导入：按物业名称、再按该物业下的单元编号找到 unit_id，找不到则报错
  async function resolveUnit(propertyName, unitCode) {
    const properties = await fetchAllRows(api.property.list, {});
    const name = propertyName.trim().toLowerCase();
    const property = properties.find((item) => String(item.name).trim().toLowerCase() === name);
    if (!property) throw new Error(t("property_not_found", { name: propertyName }));

    const units = await fetchAllRows(api.property.unitList, { property_id: String(property.id) });
    const code = unitCode.trim().toLowerCase();
    const unit = units.find((item) => String(item.code).trim().toLowerCase() === code);
    if (!unit) throw new Error(t("unit_not_found", { code: unitCode }));
    return unit;
  }

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api={api.maintenance.list}
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "keyword", label: t("search_keyword") },
            { key: "status", label: t("status"), display: (value) => labelFor(statusOptions, value) },
            { key: "priority", label: t("priority"), display: (value) => labelFor(priorityOptions, value) },
            { key: "category", label: t("category"), display: (value) => labelFor(categoryOptions, value) },
            { key: "property_id", label: t("property"), display: (value) => labelFor(propertyOptions, value) },
            { key: "created_from", label: t("created_from") },
            { key: "created_to", label: t("created_to") },
          ]}
          onClearFilter={clear}
          exportConfig={{
            filename: "maintenance-requests",
            columns: [
              { label: t("title"), get: (r) => r.title },
              { label: t("category"), get: (r) => categoryMap[r.category]?.label ?? r.category },
              { label: t("priority"), get: (r) => priorityMap[r.priority]?.label ?? r.priority },
              { label: t("status"), get: (r) => statusMap[r.status]?.label ?? r.status },
              { label: t("property"), get: (r) => r.property_name },
              { label: t("unit_code"), get: (r) => r.unit_code },
              { label: t("assignee"), get: (r) => r.assignee },
              { label: t("created_at"), get: (r) => fdl(r.created_at) },
              { label: t("updated_at"), get: (r) => fdl(r.updated_at) },
              { label: t("resolved_at"), get: (r) => fdl(r.resolved_at) },
            ],
          }}
          importConfig={{
            title: t("import_maintenance"),
            sampleName: "maintenance-import-template",
            columns: [
              { key: "title", label: t("title"), required: true, sample: "Kitchen tap leaking" },
              { key: "category", label: t("category"), sample: "plumbing" },
              { key: "priority", label: t("priority"), sample: "normal" },
              { key: "property_name", label: t("property"), required: true, sample: "Sentul Residensi" },
              { key: "unit_code", label: t("unit_code"), required: true, sample: "A-12-03" },
              { key: "assignee", label: t("assignee"), sample: "Ahmad" },
              { key: "description", label: t("description"), sample: "Water drips from the tap base" },
            ],
            onRow: async (values) => {
              const unit = await resolveUnit(values.property_name, values.unit_code);
              return request(api.maintenance.create, {
                title: values.title,
                description: values.description ?? "",
                category: values.category || "other",
                priority: values.priority || "normal",
                unit_id: String(unit.id),
                assignee: values.assignee ?? "",
              });
            },
          }}
          title={t("maintenance_requests")}
          description={t("maintenance_description")}
          summary={({ total }) => (
            <SummaryCard label={t("total_requests")} value={total} icon="build" />
          )}
          emptyText={t("no_maintenance_requests")}
          filters={(
            <>
              <Input
                variant="filter"
                name="keyword"
                label={t("search_keyword")}
                value={draft.keyword}
                placeholder={t("search_maintenance")}
                onChange={update("keyword")}
              />
              <Select variant="filter" name="status" label={t("status")} value={draft.status} onChange={update("status")} options={statusOptions} />
              <Select variant="filter" name="priority" label={t("priority")} value={draft.priority} onChange={update("priority")} options={priorityOptions} />
              <Select variant="filter" name="category" label={t("category")} value={draft.category} onChange={update("category")} options={categoryOptions} />
              <Select variant="filter" name="property_id" label={t("property")} value={draft.property_id} onChange={update("property_id")} options={propertyOptions} />
              <DatePicker
                variant="filter"
                name="created_from"
                label={t("created_from")}
                value={draft.created_from}
                max={draft.created_to || undefined}
                onChange={update("created_from")}
              />
              <DatePicker
                variant="filter"
                name="created_to"
                label={t("created_to")}
                value={draft.created_to}
                min={draft.created_from || undefined}
                onChange={update("created_to")}
              />
            </>
          )}
          resetFilters={reset}
          applyFilters={apply}
          buttons={(
            <Link className="btn btn-primary" href="/maintenance/new">
              <Icon name="add" className="text-lg" />
              <span>{t("new_maintenance_request")}</span>
            </Link>
          )}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              <th>{t("title")}</th>
              <th>{t("category")}</th>
              <th>{t("priority")}</th>
              <th>{t("status")}</th>
              <th>{t("property_and_unit")}</th>
              <th>{t("assignee")}</th>
              <th>{t("created_at")}</th>
              <th>{t("updated_at")}</th>
              <th>{t("action")}</th>
            </tr>
          )}
          body={({ rows }) =>
            rows.map((item) => (
              <tr className="group" key={item.id}>
                <td>
                  <Link
                    className="font-semibold text-scene-content group-hover:text-primary-dark transition-colors"
                    href={`/maintenance/${item.id}`}
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="text-scene-content">{categoryMap[item.category]?.label ?? item.category}</td>
                <td>
                  <StatusBadge value={item.priority} options={priorityItems} />
                </td>
                <td>
                  <StatusBadge value={item.status} options={statusItems} />
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="text-scene-content">{item.property_name || "-"}</span>
                    <span className="text-subtle text-xs">{item.unit_code || "-"}</span>
                  </div>
                </td>
                <td className="text-scene-content">{item.assignee || "-"}</td>
                <td className="whitespace-nowrap text-subtle">{fdl(item.created_at)}</td>
                <td className="whitespace-nowrap text-subtle">{fdl(item.updated_at)}</td>
                <td>
                  <div className="flex justify-center items-center gap-2">
                    <Link
                      className="btn btn-primary btn-icon"
                      href={`/maintenance/${item.id}`}
                      aria-label={t("edit")}
                    >
                      <Icon name="edit" className="text-lg" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          }
        />
      </div>
    </main>
  );
}
