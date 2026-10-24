"use client";

import { Link } from "@/i18n/navigation";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { Icon, DataTable, SummaryCard, Input, DatePicker, Select, StatusBadge } from "@/components/ui";
import { useDropdown } from "@/hooks/useDropdown";
import { useLocale } from "@/i18n";
import { request } from "@/utils/request";
import { fdl, formatMonth } from "@/utils/date";
import { formatMoney } from "@/utils/format";
import { indexBy } from "@/utils/collections";

const getInitials = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const formatRent = (value, locale) => formatMoney(value, locale, { digits: 0, fallback: "-" });

const formatBalance = (value, locale) => formatMoney(value, locale);


export default function TenantsPage() {
  const { t, locale } = useLocale();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({
    status: "",
    tenant_name: "",
    property_unit: "",
    phone: "",
    email: "",
    contract_end_from: "",
    contract_end_to: "",
  });

  // 状态的文字和颜色来自后端 dropdown：[{ id, tenant_status_display, variant }]
  const { optionsOf } = useDropdown(["tenant_status"]);
  const statusOptions = [{ value: "", label: t("all_statuses") }, ...optionsOf("tenant_status")];
  const statusMap = indexBy(statusOptions);

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api={"/tenant/list"}
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "status", label: t("status"), display: (value) => statusMap[value]?.label ?? value },
            { key: "property_unit", label: t("property_and_unit") },
            { key: "tenant_name", label: t("tenant_name") },
            { key: "phone", label: t("phone") },
            { key: "email", label: t("email") },
            { key: "contract_end_from", label: t("contract_end_from") },
            { key: "contract_end_to", label: t("contract_end_to") },
          ]}
          onClearFilter={clear}
          exportConfig={{
            filename: "tenants",
            columns: [
              { label: t("tenant_name"), get: (r) => r.name },
              { label: t("phone"), get: (r) => r.phone },
              { label: t("email"), get: (r) => r.email },
              { label: t("property"), get: (r) => r.property_name },
              { label: t("unit"), get: (r) => r.unit },
              { label: t("contract_end"), get: (r) => r.contract_end },
              { label: t("monthly_rent"), get: (r) => r.monthly_rent },
              { label: t("outstanding_balance"), get: (r) => r.outstanding_balance },
              { label: t("status"), get: (r) => statusMap[r.status]?.label ?? r.status },
              { label: t("created_at"), get: (r) => fdl(r.created_at) },
              { label: t("updated_at"), get: (r) => fdl(r.updated_at) },
            ],
          }}
          importConfig={{
            title: t("import_tenants"),
            sampleName: "tenants-import-template",
            columns: [
              { key: "username", label: t("username"), required: true, sample: "tenant_jsmith" },
              { key: "name", label: t("name"), required: true, sample: "John Smith" },
              { key: "phone", label: t("phone"), required: true, sample: "012-3456789" },
              { key: "email", label: t("email"), sample: "john@example.com" },
              { key: "status", label: t("status"), sample: "active" },
            ],
            onRow: (values) => request("/tenant/create", { ...values, status: values.status || "active" }),
          }}
          title={t("tenants")}
          description={t("manage_tenants_description")}
          summary={({ total }) => (
            <SummaryCard label={t("total_tenants")} value={total} icon="group" />
          )}
          emptyText={t("no_tenants_match_current_filters")}
          filters={(
            <>
              <Select
                variant="filter"
                name="status"
                label={t("status")}
                value={draft.status}
                onChange={(status) => setDraft((current) => ({ ...current, status }))}
                options={statusOptions}
              />

              <Input
                variant="filter"
                name="property_unit"
                label={t("property_and_unit")}
                value={draft.property_unit}
                onChange={(property_unit) => setDraft((current) => ({ ...current, property_unit }))}
              />

              <Input
                variant="filter"
                name="tenant_name"
                label={t("tenant_name")}
                value={draft.tenant_name}
                onChange={(tenant_name) => setDraft((current) => ({ ...current, tenant_name }))}
              />

              <Input
                variant="filter"
                name="phone"
                label={t("phone")}
                value={draft.phone}
                onChange={(phone) => setDraft((current) => ({ ...current, phone }))}
              />

              <Input
                variant="filter"
                name="email"
                label={t("email")}
                value={draft.email}
                onChange={(email) => setDraft((current) => ({ ...current, email }))}
              />

              <DatePicker
                variant="filter"
                name="contract_end_from"
                label={t("contract_end_from")}
                value={draft.contract_end_from}
                max={draft.contract_end_to || undefined}
                onChange={(contract_end_from) => setDraft((current) => ({ ...current, contract_end_from }))}
              />

              <DatePicker
                variant="filter"
                name="contract_end_to"
                label={t("contract_end_to")}
                value={draft.contract_end_to}
                min={draft.contract_end_from || undefined}
                onChange={(contract_end_to) => setDraft((current) => ({ ...current, contract_end_to }))}
              />
            </>
          )}
          resetFilters={reset}
          applyFilters={apply}
          buttons={(
            <>
              <Link className="btn btn-primary" href="/tenants/new">
                <Icon name="add" className="text-lg" />
                <span>{t("add_tenant")}</span>
              </Link>
            </>
          )}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              <th>{t("tenant_name")}</th>
              <th>{t("contact_info")}</th>
              <th>{t("property_and_unit")}</th>
              <th>{t("contract_end")}</th>
              <th>{t("monthly_rent")}</th>
              <th>{t("outstanding_balance")}</th>
              <th>{t("status")}</th>
              <th>{t("action")}</th>
            </tr>
          )}
          body={({ rows }) =>
            rows.map((tenant) => {
              return (
                <tr className="group" key={tenant.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold bg-scene text-primary">
                        {getInitials(tenant.name)}
                      </div>
                      <div className="flex flex-col">
                        <Link
                          className="font-semibold text-scene-content group-hover:text-primary-dark transition-colors cursor-pointer"
                          href={`/tenants/${tenant.id}`}
                        >
                          {tenant.name}
                        </Link>
                        {tenant.city ? <span className="text-subtle text-xs">{tenant.city}</span> : null}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-scene-content">{tenant.email || "-"}</span>
                        {/* {tenant.email ? (
                          <button
                            type="button"
                            className="text-subtle hover:text-primary-dark p-0.5 rounded transition-colors"
                            aria-label={t("copy_email")}
                            onClick={() => copyToClipboard(tenant.email)}
                          >
                            <Icon name="content_copy" />
                          </button>
                        ) : null} */}
                      </div>
                      <span className="text-subtle">{tenant.phone}</span>
                    </div>
                  </td>
                  <td>
                    {tenant.property_name ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-scene-content">{tenant.property_name}</span>
                        {tenant.unit ? <span className="text-subtle">{tenant.unit}</span> : null}
                      </div>
                    ) : tenant.status === "former" ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-scene-content">{t("former_resident")}</span>
                        {tenant.contract_end ? (
                          <span className="text-subtle">
                            {t("exited_on", { date: formatMonth(tenant.contract_end, locale, { month: "short", year: "numeric" }) })}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-subtle">-</span>
                    )}
                  </td>
                  <td>
                    <span>{tenant.contract_end}</span>
                  </td>
                  <td className="text-scene-content">{formatRent(tenant.monthly_rent, locale)}</td>
                  <td>
                    {Number(tenant.outstanding_balance) > 0 ? (
                      <div className="flex flex-col">
                        <span className="font-semibold text-error">{formatBalance(tenant.outstanding_balance, locale)}</span>
                        {tenant.balance_note ? <span className="text-subtle text-xs">{tenant.balance_note}</span> : null}
                      </div>
                    ) : (
                      <span className="text-scene-content">{formatBalance(tenant.outstanding_balance ?? 0, locale)}</span>
                    )}
                  </td>
                  <td>
                    <StatusBadge value={tenant.status} options={statusOptions} />
                  </td>
                  <td>
                    <div className="flex justify-center items-center gap-2">
                      <Link className="btn btn-primary btn-icon" href={`/tenants/${tenant.id}`} aria-label={t("edit_tenant")}>
                        <Icon name="andrsrxn:list-edit" className="text-scene !text-2xl" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })
          }
        />
      </div>
    </main>
  );
}