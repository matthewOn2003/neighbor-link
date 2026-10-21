"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { formatDateTime } from "./format";
import { STATUS_LABEL_KEY, STATUS_TONE } from "./status";
import { EmptyState, GlassCard, IconTile, LoadingBlock, Pill } from "./primitives";

/** Shared detail layout for a repair request or a complaint. */
export default function RequestDetail({ loading, item, icon, backHref, backLabel, optionLabelOf, rows, description, resolution }) {
  const { t, locale } = useLocale();

  if (loading && !item) return <LoadingBlock rows={3} />;
  if (!item) return <EmptyState icon="error" title={t("record_not_found")} />;

  const tone = STATUS_TONE[item.status] ?? "neutral";
  const attachments = item.attachments ?? [];
  const notes = item.notes ?? [];
  const fields = rows
    .map(([label, value]) => ({ label, value }))
    .filter((f) => f.value !== undefined && f.value !== null && f.value !== "");

  return (
    <div className="flex flex-col gap-4">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
        <Icon name="arrow_back" className="text-[16px]" />
        {backLabel}
      </Link>

      <GlassCard className="flex flex-col gap-4 p-5">
        <div className="flex items-start gap-3.5">
          <IconTile icon={icon} tone={tone} />
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold leading-snug text-on-surface">{item.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Pill tone={tone}>{t(STATUS_LABEL_KEY[item.status] ?? "portal_status_open")}</Pill>
              {item.priority ? <Pill tone="cyan">{optionLabelOf?.("maintenance_priority", item.priority) ?? item.priority}</Pill> : null}
            </div>
          </div>
        </div>

        {item.scheduled_at ? (
          <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2.5 text-xs text-cyan-200">
            <Icon name="schedule" className="text-[16px]" />
            {t("portal_visit_scheduled", { when: formatDateTime(item.scheduled_at, locale) })}
          </div>
        ) : null}

        <dl className="grid grid-cols-2 gap-3">
          {fields.map((f) => (
            <div key={f.label} className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
              <dt className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{f.label}</dt>
              <dd className="mt-1 text-xs font-semibold text-on-surface">{f.value}</dd>
            </div>
          ))}
        </dl>

        {description ? (
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("description")}</p>
            <p className="whitespace-pre-line text-sm text-on-surface">{description}</p>
          </div>
        ) : null}

        {attachments.length > 0 ? (
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("portal_attachments")}</p>
            <div className="grid grid-cols-3 gap-2">
              {attachments.map((a) =>
                a.file_url ? (
                  <a
                    key={a.id}
                    href={a.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="block aspect-square overflow-hidden rounded-xl border border-white/[0.08] bg-black/30"
                  >
                    <img src={a.file_url} alt={a.file_name} className="h-full w-full object-cover" />
                  </a>
                ) : null,
              )}
            </div>
          </div>
        ) : null}

        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("portal_property_notes")}</p>
          {notes.length === 0 ? (
            <p className="text-xs text-on-surface-variant">{t("portal_no_property_notes")}</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {notes.map((n) => (
                <li key={n.id} className="rounded-xl border border-white/[0.06] bg-black/30 p-3">
                  <div className="flex items-center justify-between gap-2 text-[11px] text-on-surface-variant">
                    <span className="truncate font-semibold text-on-surface">{n.author_name}</span>
                    <span className="shrink-0">{formatDateTime(n.created_at, locale)}</span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-xs text-on-surface">{n.body}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {resolution ? (
          <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/10 p-3.5">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300">{t("portal_resolution")}</p>
            <p className="whitespace-pre-line text-sm text-on-surface">{resolution}</p>
          </div>
        ) : null}
      </GlassCard>
    </div>
  );
}
