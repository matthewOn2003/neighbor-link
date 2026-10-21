"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/i18n";

export const TONE_CLASSES = {
  amber: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  rose: "border-rose-400/30 bg-rose-500/10 text-rose-200",
  emerald: "border-emerald-400/30 bg-emerald-500/10 text-emerald-300",
  cyan: "border-cyan-400/30 bg-cyan-500/10 text-cyan-300",
  violet: "border-primary/30 bg-primary/10 text-primary",
  gold: "border-secondary/30 bg-secondary/10 text-secondary",
  neutral: "border-white/10 bg-white/[0.04] text-on-surface-variant",
};

export const TILE_CLASSES = {
  amber: "from-amber-500/25 to-amber-500/5 border-amber-400/25 text-amber-200",
  rose: "from-rose-500/25 to-rose-500/5 border-rose-400/25 text-rose-200",
  emerald: "from-emerald-500/25 to-emerald-500/5 border-emerald-400/25 text-emerald-300",
  cyan: "from-cyan-500/25 to-cyan-500/5 border-cyan-400/25 text-cyan-300",
  violet: "from-primary/25 to-primary/5 border-primary/25 text-primary",
  gold: "from-secondary/25 to-secondary/5 border-secondary/25 text-secondary",
  neutral: "from-white/[0.06] to-white/[0.02] border-white/10 text-on-surface-variant",
};

export const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#1c1e2d]/60 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/30";

export function Pill({ tone = "neutral", icon, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TONE_CLASSES[tone] ?? TONE_CLASSES.neutral} ${className}`}
    >
      {icon ? <Icon name={icon} className="text-[12px]" /> : null}
      {children}
    </span>
  );
}

/** Rounded icon tile whose colour follows a tone. */
export function IconTile({ icon, tone = "neutral", size = "md" }) {
  const box = size === "sm" ? "h-9 w-9 rounded-xl" : "h-11 w-11 rounded-xl";
  return (
    <div className={`grid shrink-0 place-items-center border bg-gradient-to-br ${box} ${TILE_CLASSES[tone] ?? TILE_CLASSES.neutral}`}>
      <Icon name={icon} className="text-[20px]" />
    </div>
  );
}

export function GlassCard({ as: Tag = "div", className = "", children, ...rest }) {
  return (
    <Tag className={`glass-panel rounded-2xl ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function SegmentedTabs({ items, value, onChange }) {
  return (
    <div role="tablist" className="flex rounded-2xl border border-white/[0.08] bg-surface-container-low p-1">
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-all duration-300 ${
              active
                ? "bg-primary-container text-white shadow-lg shadow-primary-container/30"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {item.icon ? <Icon name={item.icon} className="text-[18px]" /> : null}
            <span>{item.label}</span>
            {item.count != null ? (
              <span className={`rounded-full px-2 text-[11px] ${active ? "bg-white/20" : "bg-white/[0.06]"}`}>{item.count}</span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function FilterChips({ items, value, onChange }) {
  return (
    <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(item.key)}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
              active ? "border-primary/40 bg-primary/15 text-primary" : "border-white/10 bg-white/[0.04] text-on-surface-variant"
            }`}
          >
            {item.label}
            {item.count != null ? ` (${item.count})` : ""}
          </button>
        );
      })}
    </div>
  );
}

export function ProgressBar({ value, max }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-white/[0.08]">
      <div className="h-full origin-left animate-bar-grow rounded-full bg-gradient-to-r from-violet-500 via-purple-400 to-primary transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.06]">
        <Icon name={icon} className="text-[28px] text-on-surface-variant" />
      </div>
      <p className="text-sm font-bold text-on-surface">{title}</p>
      {description ? <p className="max-w-xs text-xs text-on-surface-variant">{description}</p> : null}
      {action}
    </div>
  );
}

export function LoadingBlock({ rows = 3 }) {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="glass-panel shimmer-effect h-24 overflow-hidden rounded-2xl" />
      ))}
    </div>
  );
}

/** Fades a list item up, delayed by its position so a list arrives one row after another. */
export function Stagger({ index = 0, className = "", children }) {
  return (
    <div className={`animate-fade-up ${className}`} style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}>
      {children}
    </div>
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
      {children}
      {hint ? <span className="text-[11px] text-on-surface-variant/70">{hint}</span> : null}
    </label>
  );
}

export function Sheet({ open, title, subtitle, icon, onClose, footer, children }) {
  const { t } = useLocale();

  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex animate-fade-in items-end justify-center bg-black/70 backdrop-blur-md" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
        className="max-h-[90vh] w-full max-w-lg animate-sheet-up overflow-y-auto rounded-t-3xl border-t border-white/10 bg-[#161722] px-5 pb-8 pt-3 shadow-2xl"
      >
        <div className="mx-auto mb-4 h-1 w-12 rounded-full bg-white/20" />
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex min-w-0 items-center gap-2.5">
            {icon ? (
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/40 bg-primary/20">
                <Icon name={icon} className="text-[20px] text-primary" />
              </div>
            ) : null}
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-on-surface">{title}</h2>
              {subtitle ? <p className="text-xs text-on-surface-variant">{subtitle}</p> : null}
            </div>
          </div>
          <button
            type="button"
            aria-label={t("close")}
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-on-surface-variant hover:bg-white/5"
          >
            <Icon name="close" />
          </button>
        </div>
        <div className="pt-4">{children}</div>
        {footer ? <div className="mt-5 flex items-center justify-end gap-2.5 border-t border-white/10 pt-4">{footer}</div> : null}
      </div>
    </div>
  );
}

export function PrimaryButton({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-primary-container px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary-container/30 transition-all hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className = "", ...rest }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-bold text-on-surface transition-all hover:bg-white/[0.08] active:scale-[0.98] disabled:opacity-50 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

/** A section that starts collapsed (or open) and shows a one-line summary while closed. */
export function Disclosure({ icon, title, trailing, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="flex flex-col gap-2.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-surface-container-low px-4 py-3 text-left transition-colors hover:bg-white/[0.04]"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-primary/20 bg-primary/20">
            <Icon name={icon} className="text-[15px] text-primary" />
          </span>
          <span className="truncate text-sm font-bold text-on-surface">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1.5">
          {trailing ? <span className="max-w-[9rem] truncate text-[11px] font-bold text-on-surface-variant">{trailing}</span> : null}
          <Icon name={open ? "expand_less" : "expand_more"} className="text-[20px] text-on-surface-variant" />
        </span>
      </button>
      {open ? <div className="flex animate-fade-up flex-col gap-2.5">{children}</div> : null}
    </section>
  );
}
