"use client";

import { useState } from "react";
import { useList } from "@/hooks/useList";
import { useDragScroll } from "@/hooks/useDragScroll";
import { Icon } from "../Icon";

export { SummaryCard } from "./SummaryCard";

const NAV_BTN = `inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/10 text-subtle hover:text-scene-content hover:bg-[#e5eeff] text-xs font-semibold transition-colors disabled:opacity-60`;

function buildPagination(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push("...");
    out.push(p);
  });
  return out;
}

/**
 * title / description / buttons / filters：传 JSX
 * summary / header / body：传函数，参数是 ctx（rows、total、summary、loading、error、page、perPage、reload）
 */
export function DataTable({
  api,
  params,
  method = "GET",
  title,
  description,
  buttons,
  filters,
  summary,
  header,
  body,
  table = true,
  emptyText = "No records match the current filters.",
  className = "",
}) {
  const [perPage] = useState(10);
  const drag = useDragScroll();

  // 筛选条件或每页条数变化时，页码回到 1
  const scope = `${JSON.stringify(params ?? {})}|${perPage}`;
  const [pageState, setPageState] = useState({ scope, page: 1 });
  const page = pageState.scope === scope ? pageState.page : 1;
  const setPage = (next) => setPageState({ scope, page: next });

  const {
    list: rows,
    total,
    summary: summaryData,
    error,
    loading,
    reload,
  } = useList(api, { ...params, current_page: page, per_page: perPage }, method);

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = from === 0 ? 0 : from + rows.length - 1;
  const pages = buildPagination(page, totalPages);

  const ctx = { rows, total, summary: summaryData, loading, error, page, perPage, reload };

  const status = loading && rows.length === 0 ? "loading" : error ? "error" : total === 0 ? "empty" : null;
  const message =
    status === "loading" ? (
      <span className="inline-flex items-center gap-2">
        <Icon name="progress_activity" className="animate-spin" />
        Loading...
      </span>
    ) : status === "error" ? (
      <span className="inline-flex items-center gap-3 text-error">
        {error}
        <button className="underline" type="button" onClick={reload}>Retry</button>
      </span>
    ) : (
      emptyText
    );

  const bodyNode = body(ctx);

  return (
    <div className={`p-8 space-y-6 bg-accent rounded-xl shadow overflow-hidden ${className}`}>
      {/* title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-scene-content">{title}</h1>
          <p className="text-sm font-normal text-subtle">{description}</p>
        </div>
        <div className="flex items-center gap-3">{buttons}</div>
      </div>

      {/* summary */}
      {summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{summary(ctx)}</div>
      ) : null}

      {/* filters */}
      {filters ? <div className="flex flex-wrap items-center gap-3">{filters}</div> : null}

      {/* table */}
      <div className={`${loading && rows.length > 0 ? "opacity-60" : ""} transition-opacity`}>
        {table ? (
          <div className="table-wrap" {...drag}>
            <table className="table">
              <thead>{header(ctx)}</thead>
              <tbody>{status ? null : bodyNode}</tbody>
            </table>
          </div>
        ) : status ? null : (
          bodyNode
        )}

        {status ? <div className="px-6 py-10 text-center text-sm text-subtle">{message}</div> : null}
      </div>

      {/* pagination */}
      <div className="px-6 py-4 bg-accent flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-subtle">
          Showing <b className="text-scene-content font-semibold">{from}</b> to{" "}
          <b className="text-scene-content font-semibold">{to}</b> of{" "}
          <b className="text-scene-content font-semibold">{total}</b> results
        </div>
        <div className="flex items-center gap-2">
          <button className={NAV_BTN} disabled={page === 1} type="button" onClick={() => setPage(page - 1)}>
            <Icon name="chevron_left" />
            Prev
          </button>
          {pages.map((p, i) =>
            p === "..." ? (
              <span key={`e${i}`} className="px-1 text-subtle text-xs">...</span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={
                  p === page
                    ? "w-8 h-8 rounded-lg bg-primary-dark text-primary-content text-xs font-semibold flex items-center justify-center shadow"
                    : "w-8 h-8 rounded-lg text-subtle hover:bg-primary/10 hover:text-scene-content text-xs font-semibold flex items-center justify-center transition-colors"
                }
              >
                {p}
              </button>
            ),
          )}
          <button className={NAV_BTN} disabled={page >= totalPages} type="button" onClick={() => setPage(page + 1)}>
            Next
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>
    </div>
  );
}