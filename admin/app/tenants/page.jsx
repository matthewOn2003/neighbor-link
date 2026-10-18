"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { DataTable } from "@/components/ui/DataTable";
import { Checkbox } from "@/components/ui/Checkbox";
import { useRequest } from "@/hooks/useRequest";
import { useSelection } from "@/hooks/useSelection";
import { useLocale } from "@/i18n";

const getInitials = (name = "") =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

async function copyToClipboard(value) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // Ignore clipboard failures.
  }
}

export default function TenantsPage() {
  const sel = useSelection();
  const { t } = useLocale();
  const [filters, setFilters] = useState({
    keyword: "",
    status: "",
    property_id: "",
  });
  const params = { ...filters, keyword: filters.keyword.trim() };

  // 状态的文字和颜色来自后端字典：[{ value, label, variant }]
  const { data: statusOptions } = useRequest("/dictionary/options", { slug: "tenant_status" });
  const statusMap = Object.fromEntries((statusOptions ?? []).map((o) => [o.value, o]));

  return (
    <main className="flex flex-col w-full">
      <div className="p-8 space-y-6">
        <DataTable
          api="/tenant/list"
          method="POST"
          params={params}
          title={t("tenants")}
          description={t("manage_tenants_description")}
          emptyText={t("no_tenants_match_current_filters")}
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
              <th>
                <Checkbox
                  checked={sel.isAllSelected(rows)}
                  onChange={() => sel.toggleAll(rows)}
                />
              </th>
              <th>{t("tenant_name")}</th>
              <th>{t("contact_info")}</th>
              <th>{t("property_and_unit")}</th>
              <th>{t("status")}</th>
              <th className="sticky-right">{t("action")}</th>
            </tr>
          )}
          body={({ rows }) =>
            rows.map((tenant) => {
              const status = statusMap[tenant.status];
              return (
                <tr className="group" key={tenant.id}>
                  <td>
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
                      <Link
                        className="font-semibold text-scene-content group-hover:text-primary-dark transition-colors cursor-pointer"
                        href={`/tenants/${tenant.id}`}
                      >
                        {tenant.name}
                      </Link>
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
                        <span className="text-subtle">{tenant.property_address}</span>
                      </div>
                    ) : (
                      <span className="text-subtle">-</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-pill ${status?.variant ?? "neutral"}`}>
                      {status?.label ?? tenant.status}
                    </span>
                  </td>
                  <td className="sticky-right">
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