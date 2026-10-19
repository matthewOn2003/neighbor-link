"use client";

import { Link } from "@/i18n/navigation";
import { useState } from "react";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { Icon } from "@/components/ui/Icon";
import { DataTable } from "@/components/ui/DataTable";
import { SearchBar } from "@/components/ui/SearchBar";
import { Checkbox } from "@/components/ui/Checkbox";
import { Select } from "@/components/ui/Select";
import { useRequest } from "@/hooks/useRequest";
import { useDropdown } from "@/hooks/useDropdown";
import { useSelection } from "@/hooks/useSelection";
import { useLocale } from "@/i18n";

const getInitials = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

const formatRent = (value, locale) =>
  value == null ? "-" : `RM ${Number(value).toLocaleString(locale, { maximumFractionDigits: 0 })}`;

const formatBalance = (value, locale) =>
  `RM ${Number(value).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatMonthYear = (date, locale) =>
  new Date(`${date}T00:00:00`).toLocaleDateString(locale, { month: "short", year: "numeric" });

async function copyToClipboard(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // Ignore clipboard failures.
  }
}

export default function TenantsPage() {
  const sel = useSelection();
  const { t, locale } = useLocale();
  const [filters, setFilters] = useState({ status: "", property_id: "" });
  const [keywordInput, setKeywordInput] = useState("");
  const debouncedKeyword = useDebouncedValue(keywordInput, 300);
  const params = { ...filters, keyword: debouncedKeyword.trim() };
  const hasActiveFilters = keywordInput.trim() !== "" || filters.status !== "" || filters.property_id !== "";

  const resetFilters = () => {
    setKeywordInput("");
    setFilters({ status: "", property_id: "" });
  };

  // 状态的文字和颜色来自后端 dropdown：[{ id, tenant_status_display, variant }]
  const { optionsOf } = useDropdown(["tenant_status"]);
  const statusOptions = optionsOf("tenant_status");
  const statusMap = Object.fromEntries(statusOptions.map((option) => [option.value, option]));

  const { data: propertyData } = useRequest("/property/list", { per_page: 100 });
  const propertyOptions = propertyData?.list ?? [];

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api="/tenant/list"
          params={params}
          title={t("tenants")}
          description={t("manage_tenants_description")}
          emptyText={t("no_tenants_match_current_filters")}
          filters={(
            <>
              <SearchBar
                value={keywordInput}
                onChange={setKeywordInput}
                placeholder={t("search_tenants")}
              />

              <div className="min-w-[160px]">
                <Select
                  label={t("status")}
                  name="tenant-status-filter"
                  value={filters.status}
                  onChange={(status) => setFilters((current) => ({ ...current, status }))}
                  options={[{ value: "", label: t("all_statuses") }, ...statusOptions]}
                />
              </div>

              <div className="min-w-[180px]">
                <Select
                  label={t("property_and_unit")}
                  name="tenant-property-filter"
                  value={filters.property_id}
                  onChange={(property_id) => setFilters((current) => ({ ...current, property_id }))}
                  options={[{ value: "", label: t("all_properties") }, ...propertyOptions.map((property) => ({ value: String(property.id), label: property.name }))]}
                />
              </div>

              {hasActiveFilters ? (
                <button className="btn btn-outline" type="button" onClick={resetFilters}>
                  <Icon name="restart_alt" className="text-lg" />
                  <span>{t("reset_filters")}</span>
                </button>
              ) : null}
            </>
          )}
          buttons={(
            <>
              <button className="btn btn-outline" type="button">
                <Icon name="file_upload" className="text-lg" />
                <span>{t("export_csv")}</span>
              </button>

              <Link className="btn btn-primary" href="/tenants/new">
                <Icon name="add" className="text-lg" />
                <span>{t("add_tenant")}</span>
              </Link>
            </>
          )}
          header={({ rows }) => (
            <tr className="bg-accent text-subtle font-semibold">
              <th className="sticky-left">
                <Checkbox
                  checked={sel.isAllSelected(rows)}
                  onChange={() => sel.toggleAll(rows)}
                />
              </th>
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
              const status = statusMap[tenant.status];
              return (
                <tr className="group" key={tenant.id}>
                  <td className="sticky-left">
                    <Checkbox
                      checked={sel.isSelected(tenant.id)}
                      onChange={() => sel.toggle(tenant.id)}
                    />
                  </td>
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
                        {tenant.email ? (
                          <button
                            type="button"
                            className="text-subtle hover:text-primary-dark p-0.5 rounded transition-colors"
                            aria-label={t("copy_email")}
                            onClick={() => copyToClipboard(tenant.email)}
                          >
                            <Icon name="content_copy" />
                          </button>
                        ) : null}
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
                            {t("exited_on", { date: formatMonthYear(tenant.contract_end, locale) })}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-subtle">-</span>
                    )}
                  </td>
                  <td>
                    {tenant.contract_end ? (
                      <div className="flex items-center gap-2 text-scene-content">
                        <span>{tenant.contract_end}</span>
                        {tenant.status === "pending_renewal" ? (
                          <span title={t("renewal_pending")} className="text-error inline-flex">
                            <Icon name="warning" className="text-lg" />
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-subtle">-</span>
                    )}
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
                    <span className={`status-pill ${status?.variant ?? "neutral"}`}>
                      {status?.label ?? tenant.status}
                    </span>
                  </td>
                  <td>
                    <div className="inline-flex items-center gap-2">
                      <Link
                        className="p-2 text-subtle hover:text-primary-dark"
                        href={`/tenants/${tenant.id}`}
                        aria-label={t("edit_tenant")}
                      >
                        <Icon name="edit" className="!text-2xl" />
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