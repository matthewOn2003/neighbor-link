export function FormActions({
  onCancel,
  submitLabel = "Save",
  loading = false,
}: {
  onCancel: () => void;
  submitLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex justify-end gap-3" style={{ marginTop: "var(--section-gap)" }}>
      <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
        Cancel
      </button>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? "Saving…" : submitLabel}
      </button>
    </div>
  );
}
