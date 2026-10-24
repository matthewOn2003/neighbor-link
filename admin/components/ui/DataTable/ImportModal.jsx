"use client";

import { useState } from "react";
import { Modal } from "../Modal";
import { FileDropzone } from "../FileDropzone";
import { Spinner } from "../Spinner";
import { useLocale } from "@/i18n";
import { downloadSampleXlsx, readSpreadsheet } from "@/utils/excel";
import { apiErrorMessage } from "@/utils/errors";

// 把表格的一行映射为 { key: value }，表头可以是 label 或 key（不区分大小写）。
function resolveRow(raw, columns) {
  const lookup = new Map();
  Object.keys(raw).forEach((header) => lookup.set(header.toLowerCase(), header));
  const values = {};
  for (const column of columns) {
    const header = lookup.get(column.label.toLowerCase()) ?? lookup.get(column.key.toLowerCase());
    values[column.key] = header ? raw[header] : "";
  }
  return values;
}

/**
 * 导入 Excel 批量创建记录。
 * columns: [{ key, label, required, sample }]
 * onRow(values) 对每一行调用，抛错即记为该行失败，继续处理其他行。
 */
export function ImportModal({ open, onClose, title, columns, sampleName, onRow, onFinished }) {
  const { t } = useLocale();
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [headerError, setHeaderError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [results, setResults] = useState(null);

  function reset() {
    setFileName("");
    setRows([]);
    setHeaderError("");
    setResults(null);
    setProgress({ done: 0, total: 0 });
  }

  function handleClose() {
    if (submitting) return;
    reset();
    onClose?.();
  }

  async function handleFile(file) {
    reset();
    setFileName(file.name);
    try {
      const { headers, rows: parsed } = await readSpreadsheet(file);
      const normalized = headers.map((header) => header.toLowerCase());
      const missing = columns
        .filter((column) => column.required)
        .filter((column) => !normalized.includes(column.label.toLowerCase()) && !normalized.includes(column.key.toLowerCase()))
        .map((column) => column.label);
      if (missing.length > 0) {
        setHeaderError(t("import_missing_columns", { columns: missing.join(", ") }));
        return;
      }
      setRows(parsed.map((raw) => resolveRow(raw, columns)));
    } catch {
      setHeaderError(t("import_read_failed"));
    }
  }

  async function runImport() {
    setSubmitting(true);
    setResults(null);
    const failures = [];
    let succeeded = 0;
    setProgress({ done: 0, total: rows.length });
    for (let index = 0; index < rows.length; index += 1) {
      const values = rows[index];
      const missingRequired = columns.find((column) => column.required && !values[column.key]);
      if (missingRequired) {
        failures.push({ line: index + 2, message: t("import_field_required", { field: missingRequired.label }) });
      } else {
        try {
          await onRow(values);
          succeeded += 1;
        } catch (err) {
          failures.push({ line: index + 2, message: apiErrorMessage(err, t, { fallbackKey: "import_row_failed" }) });
        }
      }
      setProgress({ done: index + 1, total: rows.length });
    }
    setSubmitting(false);
    setResults({ succeeded, failures });
    onFinished?.();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      size="lg"
      footer={(
        <>
          <button type="button" className="btn btn-outline" onClick={handleClose} disabled={submitting}>
            {results ? t("close") : t("cancel")}
          </button>
          {!results ? (
            <button type="button" className="btn btn-primary" onClick={runImport} disabled={submitting || rows.length === 0}>
              {submitting ? <><Spinner size="sm" label={t("importing")} /> {t("importing")}</> : t("import_start", { count: rows.length })}
            </button>
          ) : null}
        </>
      )}
    >
      <div className="space-y-5">
        <div className="flex flex-col gap-3 rounded-lg border border-line/40 bg-scene p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-scene-content">{t("import_template_title")}</p>
            <p className="text-xs text-subtle">
              {t("import_columns_hint")}: {columns.map((column) => `${column.label}${column.required ? " *" : ""}`).join(" · ")}
            </p>
          </div>
          <button
            type="button"
            className="btn btn-outline shrink-0"
            onClick={() => downloadSampleXlsx(sampleName, columns)}
          >
            {t("download_sample")}
          </button>
        </div>

        <FileDropzone
          accept=".xlsx,.xls,.csv"
          onFile={handleFile}
          disabled={submitting}
          hint={t("import_drop_hint")}
          fileName={fileName}
        />

        {headerError ? <p className="text-sm text-error">{headerError}</p> : null}
        {rows.length > 0 && !submitting && !results ? (
          <p className="text-sm text-subtle">{t("import_rows_ready", { count: rows.length })}</p>
        ) : null}

        {submitting ? (
          <p className="text-sm text-subtle">
            {t("import_progress", { done: progress.done, total: progress.total })}
          </p>
        ) : null}

        {results ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-scene-content">
              {t("import_result", { succeeded: results.succeeded, failed: results.failures.length })}
            </p>
            {results.failures.length > 0 ? (
              <ul className="max-h-48 space-y-1 overflow-y-auto text-xs text-error">
                {results.failures.map((failure) => (
                  <li key={failure.line}>
                    {t("import_line", { line: failure.line })}: {failure.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
