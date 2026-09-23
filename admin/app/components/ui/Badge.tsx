type BadgeVariant = "success" | "warning" | "danger" | "neutral";

const VARIANT_STYLES: Record<BadgeVariant, { background: string; color: string }> = {
  success: { background: "rgba(49, 120, 92, 0.12)", color: "#31785c" },
  warning: { background: "rgba(216, 158, 67, 0.14)", color: "#a3701f" },
  danger: { background: "rgba(174, 56, 45, 0.12)", color: "var(--error)" },
  neutral: { background: "var(--line)", color: "var(--ink-muted)" },
};

export function Badge({ children, variant = "neutral" }: { children: React.ReactNode; variant?: BadgeVariant }) {
  const style = VARIANT_STYLES[variant];
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: style.background, color: style.color }}
    >
      {children}
    </span>
  );
}
