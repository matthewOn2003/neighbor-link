"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { SearchBar } from "@/components/ui/SearchBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useRequest } from "@/hooks/useRequest";
import { request } from "@/services/request";
import { useLocale } from "@/i18n";
import { useToast } from "@/components/ui";

const money = (value, locale) =>
  "RM " + Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusKeys = {
  draft: "contract_status_draft",
  active: "contract_status_active",
  expired: "contract_status_expired",
  terminated: "contract_status_terminated",
};

export default function ContractsPage() {
  const { t, locale } = useLocale();
  const toast = useToast();
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const keyword = useDebouncedValue(input.trim(), 300);
  const { data, loading, error, reload } = useRequest("/contract/list", {
    current_page: page,
    per_page: 10,
    keyword,
    status,
  });
  const rows = data?.list ?? [];
  const pagination = data?.pagination;
  const statuses = ["", "draft", "active", "expired", "terminated"];

  async function activate(contract) {
    try {
      await request("/contract/update/" + contract.id, {
        tenant_id: contract.tenant_id,
        start_date: contract.start_date,
        end_date: contract.end_date,
        monthly_rent: contract.monthly_rent,
        security_deposit: contract.security_deposit,
        billing_day: contract.billing_day,
        status: "active",
        notes: contract.notes || "",
      });
      toast.success(t("contract_activated"));
      reload();
    } catch (error) {
      toast.error(error.code === "ACTIVE_CONTRACT_EXISTS" ? t("contract_active_exists") : t("contract_save_failed"));
    }
  }

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <section className="panel">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-scene-content">{t("contracts")}</h1>
              <p className="text-sm font-normal text-subtle">{t("contracts_description")}</p>
            </div>
            <Link className="btn btn-primary" href="/contracts/new">
              <Icon name="add" className="text-lg" />
              <span>{t("new_contract")}</span>
            </Link>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div role="tablist" aria-label={t("status")} className="flex items-center gap-1 p-1 rounded-lg bg-scene overflow-x-auto">
              {statuses.map((value) => {
                const active = status === value;
                return (
                  <button
                    key={value || "all"}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => { setStatus(value); setPage(1); }}
                    className={`inline-flex items-center px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${active ? "bg-accent text-primary shadow" : "text-subtle hover:text-scene-content"}`}
                  >
                    {t(value ? statusKeys[value] : "all_contract_statuses")}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SearchBar
                value={input}
                onChange={(value) => { setInput(value); setPage(1); }}
                placeholder={t("search_contracts")}
              />
              {(input.trim() || status) ? (
                <button className="btn btn-outline" type="button" onClick={() => { setInput(""); setStatus(""); setPage(1); }}>
                  <Icon name="restart_alt" className="text-lg" />
                  <span>{t("reset_filters")}</span>
                </button>
              ) : null}
            </div>
          </div>

          {error ? <p role="alert" className="mt-4 text-sm text-error">{error}</p> : null}
          {loading ? (
            <div className="flex min-h-48 items-center justify-center"><Spinner size="lg" /></div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center text-sm text-subtle">{t("no_contracts")}</div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-xl border border-scene">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead className="bg-accent text-xs uppercase text-subtle">
                  <tr>{["contract_number", "tenant", "property_and_unit", "contract_term", "monthly_rent", "status", "action"].map((key) => <th key={key} className="px-4 py-3 font-semibold">{t(key)}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-scene">
                  {rows.map((contract) => (
                    <tr className="group hover:bg-scene/50 transition-colors" key={contract.id}>
                      <td className="px-4 py-4 font-semibold whitespace-nowrap">
                        <Link href={"/contracts/" + contract.id} className="text-primary-dark hover:underline">CT-{String(contract.id).padStart(5, "0")}</Link>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-semibold text-scene-content">{contract.tenant_name}</div>
                        <div className="text-xs text-subtle">{contract.tenant_phone || "—"}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div>{contract.property_name || "—"}</div>
                        <div className="text-xs text-subtle">{contract.unit_code || "—"}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{contract.start_date} – {contract.end_date}</td>
                      <td className="px-4 py-4 whitespace-nowrap font-semibold">{money(contract.monthly_rent, locale)}</td>
                      <td className="px-4 py-4"><span className={"status-pill " + (contract.status === "active" ? "success" : contract.status === "expired" ? "warning" : "neutral")}>{t(statusKeys[contract.status] || statusKeys.draft)}</span></td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <Link href={"/contracts/" + contract.id} className="text-primary-dark hover:underline">{t("view_details")}</Link>
                        {contract.status === "draft" ? <button type="button" className="ml-3 text-primary-dark hover:underline" onClick={() => activate(contract)}>{t("activate_contract")}</button> : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.last_page > 1 ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="text-subtle">{t("pagination_summary", { current: pagination.current_page, last: pagination.last_page, total: pagination.total })}</span>
              <div className="flex gap-2">
                <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn btn-outline disabled:opacity-40">{t("previous")}</button>
                <button disabled={page >= pagination.last_page} onClick={() => setPage(page + 1)} className="btn btn-outline disabled:opacity-40">{t("next")}</button>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
