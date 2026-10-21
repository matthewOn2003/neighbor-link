"use client";

import { useLocale } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { formatDate, formatDateTime } from "./format";
import { COMPLAINT_ICON, MAINTENANCE_ICON, PRIORITY_TONE, STATUS_LABEL_KEY, STATUS_TONE } from "./status";
import { GlassCard, IconTile, Pill } from "./primitives";

export function RepairCard({ item, categoryLabel, priorityLabel }) {
  const { t, locale } = useLocale();
  const tone = STATUS_TONE[item.status] ?? "neutral";
  return (
    <Link href={`/maintenance/${item.id}`} className="block">
      <GlassCard className="flex flex-col gap-3 p-4 transition-transform active:scale-[0.99]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <IconTile icon={MAINTENANCE_ICON[item.category] ?? "build"} tone={tone} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-on-surface">{item.title}</p>
              <p className="truncate text-[11px] text-on-surface-variant">
                {[categoryLabel, item.unit_code].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>
          <Pill tone={tone} icon={item.status === "resolved" ? "check_circle" : undefined}>
            {t(STATUS_LABEL_KEY[item.status] ?? "portal_status_open")}
          </Pill>
        </div>

        {item.description ? <p className="line-clamp-2 text-xs text-on-surface-variant">{item.description}</p> : null}

        {item.scheduled_at && (item.status === "open" || item.status === "in_progress") ? (
          <div className="flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
            <Icon name="schedule" className="text-[16px]" />
            {t("portal_visit_scheduled", { when: formatDateTime(item.scheduled_at, locale) })}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
          <div className="flex min-w-0 items-center gap-2">
            <Pill tone={PRIORITY_TONE[item.priority] ?? "neutral"}>{priorityLabel}</Pill>
            <span className="truncate text-[11px] text-on-surface-variant">
              {item.assignee || t("portal_unassigned")}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {item.note_count > 0 ? <Pill icon="visibility">{t("portal_note_count", { count: item.note_count })}</Pill> : null}
            <span className="text-[11px] text-on-surface-variant">{formatDate(item.created_at, locale)}</span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}

export function ComplaintCard({ item, categoryLabel }) {
  const { t, locale } = useLocale();
  const tone = STATUS_TONE[item.status] ?? "neutral";
  return (
    <Link href={`/complaints/${item.id}`} className="block">
      <GlassCard className="flex flex-col gap-3 p-4 transition-transform active:scale-[0.99]">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <IconTile icon={COMPLAINT_ICON[item.category] ?? "report"} tone={tone} />
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-on-surface">{item.title}</p>
              <p className="truncate text-[11px] text-on-surface-variant">
                {[categoryLabel, item.unit_code].filter(Boolean).join(" • ")}
              </p>
            </div>
          </div>
          <Pill tone={tone}>{t(STATUS_LABEL_KEY[item.status] ?? "portal_status_open")}</Pill>
        </div>

        {item.description ? <p className="line-clamp-2 text-xs text-on-surface-variant">{item.description}</p> : null}

        <div className="flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
          <span className="truncate text-[11px] text-on-surface-variant">
            {item.status === "resolved" && item.assignee
              ? t("portal_resolved_by", { name: item.assignee })
              : item.assignee || t("portal_unassigned")}
          </span>
          <div className="flex shrink-0 items-center gap-2">
            {item.note_count > 0 ? <Pill icon="visibility">{t("portal_note_count", { count: item.note_count })}</Pill> : null}
            <span className="text-[11px] text-on-surface-variant">{formatDate(item.created_at, locale)}</span>
          </div>
        </div>
      </GlassCard>
    </Link>
  );
}
