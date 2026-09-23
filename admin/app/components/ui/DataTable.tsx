import { EmptyState } from "./EmptyState";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  width?: string;
};

export type PaginationMeta = {
  current_page: number;
  per_page: number;
  last_page: number;
  total: number;
};

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  pagination,
  onPageChange,
  loading = false,
  emptyTitle = "No results",
  emptyDescription,
}: {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  return (
    <div>
      <div className="table-wrap">
        <table className="table">
          <thead className="table-head">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="table-head-cell" style={{ width: column.width }}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={`skeleton-${index}`} className="table-row">
                  {columns.map((column) => (
                    <td key={column.key} className="table-cell">
                      <div className="skeleton skeleton-row" style={{ height: "1rem" }} />
                    </td>
                  ))}
                </tr>
              ))}

            {!loading &&
              rows.map((row) => (
                <tr key={rowKey(row)} className="table-row">
                  {columns.map((column) => (
                    <td key={column.key} className="table-cell">
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>

        {!loading && rows.length === 0 && (
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
              onClick={() => onPageChange?.(pagination.current_page - 1)}
            >
              Previous
            </button>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => onPageChange?.(pagination.current_page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
