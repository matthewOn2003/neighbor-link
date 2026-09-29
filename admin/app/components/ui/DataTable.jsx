"use client";

import { Fragment, useEffect, useState } from "react";
import { useApi } from "@/lib/useApi";
import { EmptyState } from "./EmptyState";

/**
 * Self-fetching table shell.
 *
 * api          -> list endpoint path, e.g. "/property/list"
 * params       -> extra query params, e.g. { keyword: "oak", status: "vacant" }
 * perPage      -> page size (default 10)
 * head         -> <th> cells
 * columns      -> column count, used by the loading skeleton
 * reloadKey    -> change this value to force a refetch (e.g. after delete)
 * children     -> (row, index) => <tr>...</tr>
 */
export function DataTable({
  api,
  params,
  perPage = 10,
  head,
  columns = 1,
  reloadKey,
  rowKey,
  children,
  emptyTitle = "No results",
  emptyDescription,
}) {
  const request = useApi();
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Reset to page 1 whenever the endpoint or filters change.
  const queryKey = `${api}|${perPage}|${JSON.stringify(params ?? {})}`;
  const [prevQueryKey, setPrevQueryKey] = useState(queryKey);
  if (prevQueryKey !== queryKey) {
    setPrevQueryKey(queryKey);
    setPage(1);
  }

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const search = new URLSearchParams();
    search.set("current_page", String(page));
    search.set("per_page", String(perPage));
    Object.entries(params ?? {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        search.set(key, String(value));
      }
    });
    const url = `${api}${api.includes("?") ? "&" : "?"}${search.toString()}`;

    request(url, undefined, { method: "GET" })
      .then((res) => {
        if (cancelled) return;
        setRows(res.data.list ?? []);
        setPagination(res.data.pagination ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setRows([]);
        setPagination(null);
        setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey, page, reloadKey]);

  return (
    <div>
      <div className="table-wrap">
        <table className="table">
          <thead className="table-head">
            <tr>{head}</tr>
          </thead>
          <tbody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={`skeleton-${i}`} className="table-row">
                  {Array.from({ length: columns }).map((_, j) => (
                    <td key={j} className="table-cell">
                      <div className="skeleton skeleton-row" style={{ height: "1rem" }} />
                    </td>
                  ))}
                </tr>
              ))
              : rows.map((row, index) => (
                <Fragment key={rowKey?.(row) ?? row.id ?? index}>
                  {children(row, index)}
                </Fragment>
              ))}
          </tbody>
        </table>

        {!loading && error && (
          <div className="table-empty">
            <EmptyState title="Failed to load" description={error} />
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div className="table-empty">
            <EmptyState title={emptyTitle} description={emptyDescription} />
          </div>
        )}
      </div>

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between" style={{ marginTop: "1rem" }}>
          <span style={{ fontSize: "0.8125rem", color: "var(--ink-muted)" }}>
            Page {pagination.current_page} of {pagination.last_page} · {pagination.total} total
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={pagination.current_page <= 1}
              onClick={() => setPage(pagination.current_page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => setPage(pagination.current_page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}