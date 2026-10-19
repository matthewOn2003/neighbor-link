"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { SearchBar } from "@/components/ui/SearchBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { request } from "@/services/request";
import { useToast } from "@/components/ui";
import { useRequest } from "@/hooks/useRequest";
import { useLocale } from "@/i18n";

const money = (value, locale) =>
  "RM " + Number(value || 0).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const statusKeys = {
  unpaid: "bill_status_unpaid",
  partial: "bill_status_partial",
  paid: "bill_status_paid",
  overdue: "bill_status_overdue",
  void: "bill_status_void",
};
const statusClass = { unpaid: "neutral", partial: "warning", paid: "success", overdue: "danger", void: "neutral" };

export default function BillsPage() {
  const { t, locale } = useLocale();
  const toast = useToast();
  const [generating, setGenerating] = useState(false);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState("");
  const [period, setPeriod] = useState("");
  const [page, setPage] = useState(1);
  const keyword = useDebouncedValue(input.trim(), 300);
  const { data, loading, error, reload } = useRequest("/bill/list", {
    current_page: page,
    per_page: 10,
    keyword,
    status,
    period,
  });
  const rows = data?.list ?? [];
  const pagination = data?.pagination;
  const summary = data?.summary ?? {};
  const statuses = ["", "unpaid", "partial", "paid", "overdue", "void"];

  async function generateBills() {
    setGenerating(true);
    try {
      const result = await request("/bill/generate", { billing_period: period || new Date().toISOString().slice(0, 7) });
      toast.success(t("bills_generated", { count: result.generated_count }));
      reload();
    } catch {
      toast.error(t("bill_generate_failed"));
    } finally {
      setGenerating(false);
    }
  }

  const hasFilters = Boolean(input.trim() || status || period);

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <section className="panel">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-scene-content">{t("bills")}</h1>
              <p className="text-sm font-normal text-subtle">{t("bills_description")}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={generating} onClick={generateBills} className="btn btn-outline disabled:opacity-40">
                <Icon name="autorenew" className="text-lg" />
                <span>{generating ? t("generating_bills") : t("generate_monthly_bills")}</span>
              </button>
              <Link href="/bills/new" className="btn btn-primary">
                <Icon name="add" className="text-lg" />
                <span>{t("create_bill")}</span>
              </Link>
            </div>
          </div>

          <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[
              ["bill_total_amount", money(summary.total_amount, locale), "receipt_long"],
              ["bill_total_paid", money(summary.total_paid, locale), "task_alt"],
              ["bill_outstanding", money(summary.outstanding, locale), "account_balance_wallet"],
              ["bill_overdue_count", String(summary.overdue_count ?? 0), "schedule"],
            ].map(([key, value, icon]) => (
              <div key={key} className="rounded-xl bg-scene p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-subtle">{t(key)}</p>
                  <Icon name={icon} className="text-xl text-primary" />
                </div>
                <p className="mt-2 text-2xl font-semibold text-scene-content">{value}</p>
              </div>
            ))}
          </section>

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div className="flex-1 xl:max-w-md">
              <SearchBar value={input} onChange={(value) => { setInput(value); setPage(1); }} placeholder={t("search_bills")} />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <input aria-label={t("billing_period")} type="month" value={period} onChange={(event) => { setPeriod(event.target.value); setPage(1); }} className="input min-w-[160px]" />
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
                      className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${active ? "bg-accent text-primary shadow" : "text-subtle hover:text-scene-content"}`}
                    >
                      {t(value ? statusKeys[value] : "all_bill_statuses")}
                    </button>
                  );
                })}
              </div>
              {hasFilters ? (
                <button className="btn btn-outline" type="button" onClick={() => { setInput(""); setStatus(""); setPeriod(""); setPage(1); }}>
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
            <div className="p-12 text-center text-sm text-subtle">{t("no_bills")}</div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-accent text-xs uppercase text-subtle">
                  <tr>{["bill_number", "tenant", "billing_period", "due_date", "bill_amount", "bill_paid", "status", "action"].map((key) => <th key={key} className="px-4 py-3 font-semibold">{t(key)}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-scene">
                  {rows.map((bill) => (
                    <tr className="group hover:bg-scene/50 transition-colors" key={bill.id}>
                      <td className="px-4 py-4 font-semibold whitespace-nowrap">
                        <Link href={"/bills/" + bill.id} className="text-primary-dark hover:underline">BL-{String(bill.id).padStart(5, "0")}</Link>
                      </td>
                      <td className="px-4 py-4">
                        <div className="font-medium text-scene-content">{bill.tenant_name}</div>
                        <div className="text-xs text-subtle">{bill.property_name || "—"} · {bill.unit_code || "—"}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">{bill.billing_period}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{bill.due_date}</td>
                      <td className="px-4 py-4 whitespace-nowrap font-medium">{money(Number(bill.amount) + Number(bill.late_fee), locale)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">{money(bill.amount_paid, locale)}</td>
                      <td className="px-4 py-4"><span className={"status-pill " + (statusClass[bill.status] || "neutral")}>{t(statusKeys[bill.status] || statusKeys.unpaid)}</span></td>
                      <td className="px-4 py-4 whitespace-nowrap"><Link href={"/bills/" + bill.id} className="text-primary-dark hover:underline">{t("view_details")}</Link></td>
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
