import { Spinner } from "./Spinner";

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
      <button type="button" className="btn btn-outline" onClick={onCancel} disabled={loading}>
        Cancel
      </button>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <span className="inline-flex items-center gap-2"><Spinner size="sm" label="Saving" /> Saving…</span> : submitLabel}
      </button>
    </div>
  );
}
