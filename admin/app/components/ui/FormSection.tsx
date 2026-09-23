export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "var(--section-gap)" }}>
      <div style={{ marginBottom: "var(--header-gap)" }}>
        <h2 style={{ fontSize: "1.0625rem", fontWeight: 700, color: "var(--foreground)", margin: 0 }}>{title}</h2>
        {description && <p style={{ marginTop: "0.25rem", color: "var(--ink-muted)", fontSize: "0.875rem" }}>{description}</p>}
      </div>
      <div className="grid gap-[var(--field-gap)]">{children}</div>
    </section>
  );
}
