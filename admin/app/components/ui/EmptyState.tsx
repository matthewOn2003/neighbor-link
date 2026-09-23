export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <p style={{ fontWeight: 600, color: "var(--foreground)", fontSize: "0.9375rem" }}>{title}</p>
      {description && <p style={{ color: "var(--ink-muted)", fontSize: "0.875rem", maxWidth: "24rem" }}>{description}</p>}
      {action && <div style={{ marginTop: "0.5rem" }}>{action}</div>}
    </div>
  );
}
