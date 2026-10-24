"use client";

import { useState } from "react";
import { useList } from "@/hooks/useList";
import { useLocale } from "@/i18n";
import { downloadRowsAsXlsx, fetchAllRows } from "@/utils/excel";
import { Icon } from "../Icon";
import { Spinner } from "../Spinner";
import { FilterSection } from "./FilterSection";
import { ImportModal } from "./ImportModal";
import { apiErrorMessage } from "@/utils/errors";

export { SummaryCard } from "./SummaryCard";
export { FilterSection } from "./FilterSection";

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
 *
 * exportConfig：{ filename, columns: [{ label, get(row) }] }，传入后显示导出按钮（导出当前筛选下的全部记录）
 * importConfig：{ title, sampleName, columns: [{ key, label, required, sample }], onRow(values) }，
 *               传入后显示导入按钮（位于导出按钮旁边），onRow 对每行执行创建
 */
export function DataTable({
  api,
  params,
  filterValues,
  filterBadges,
  onClearFilter,
  title,
  description,
  buttons,
  filters,
  filterHint,
  resetFilters,
  applyFilters,
  summary,
  header,
  body,
  table = true,
  emptyText,
  className = "",
  exportConfig,
  importConfig,
}) {
  const { t } = useLocale();
  const [perPage] = useState(10);
  const [exporting, setExporting] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  // const drag = useDragScroll();

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
  } = useList(api, { ...params, current_page: page, per_page: perPage });

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = from === 0 ? 0 : from + rows.length - 1;
  const pages = buildPagination(page, totalPages);

  const ctx = { rows, total, summary: summaryData, loading, error, page, perPage, reload };

  const status = loading && rows.length === 0 ? "loading" : error ? "error" : total === 0 ? "empty" : null;
  const message =
    status === "loading" ? (
      <span className="inline-flex items-center gap-2">
        <Spinner size="sm" label={t("loading")} />
        {t("loading")}
      </span>
    ) : status === "error" ? (
      <span className="inline-flex items-center gap-3 text-error">
        {error}
        <button className="underline" type="button" onClick={reload}>{t("retry")}</button>
      </span>
    ) : (
      emptyText ?? t("no_records_match_filters")
    );

  async function handleExport() {
    if (!exportConfig || exporting) return;
    setExporting(true);
    try {
      const all = await fetchAllRows(api, params ?? {});
      downloadRowsAsXlsx(exportConfig.filename, exportConfig.columns, all);
    } catch (err) {
      window.alert(apiErrorMessage(err, t, { fallbackKey: "export_failed" }));
    } finally {
      setExporting(false);
    }
  }

  const bodyNode = body(ctx);

  return (
    <div className={`panel ${className}`}>
      {/* title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold text-scene-content">{title}</h1>
          <p className="text-sm font-normal text-subtle">{description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {exportConfig ? (
            <button className="btn btn-outline" type="button" onClick={handleExport} disabled={exporting}>
              <Icon name="download" className="text-lg" />
              <span>{exporting ? t("exporting") : t("export_excel")}</span>
            </button>
          ) : null}
          {importConfig ? (
            <button className="btn btn-outline" type="button" onClick={() => setImportOpen(true)}>
              <Icon name="upload" className="text-lg" />
              <span>{t("import_excel")}</span>
            </button>
          ) : null}
          {buttons}
        </div>
      </div>

      {/* summary */}
      {summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-6 gap-4">{summary(ctx)}</div>
      ) : null}

      {/* <hr className="border-line/40" /> */}

      {/* filters */}
      {filters ? (
        <FilterSection
          values={filterValues ?? params}
          badges={filterBadges}
          onClear={onClearFilter}
          filterHint={filterHint}
          resetFilters={resetFilters}
          applyFilters={applyFilters}
        >
          {filters}
        </FilterSection>
      ) : null}


      {/* table */}
      <div className={`${loading && rows.length > 0 ? "opacity-60" : ""} transition-opacity`}>
        {table ? (
          // <div className="table-wrap" {...drag}>
          <div className="table-wrap">
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

      {importConfig ? (
        <ImportModal
          open={importOpen}
          onClose={() => setImportOpen(false)}
          title={importConfig.title}
          columns={importConfig.columns}
          sampleName={importConfig.sampleName}
          onRow={importConfig.onRow}
          onFinished={reload}
        />
      ) : null}

      {/* pagination */}
      <div className="px-6 py-4 bg-accent flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-subtle">
          {t("showing")} <b className="text-scene-content font-semibold">{from}</b> {t("to")}{" "}
          <b className="text-scene-content font-semibold">{to}</b> {t("of")}{" "}
          <b className="text-scene-content font-semibold">{total}</b> {t("results")}
        </div>
        <div className="flex items-center gap-2">
          <button className="table-nav-btn" disabled={page === 1} type="button" onClick={() => setPage(page - 1)}>
            <Icon name="chevron_left" />
            {t("previous")}
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
          <button className="table-nav-btn" disabled={page >= totalPages} type="button" onClick={() => setPage(page + 1)}>
            {t("next")}
            <Icon name="chevron_right" />
          </button>
        </div>
      </div>
    </div>
  );
}
