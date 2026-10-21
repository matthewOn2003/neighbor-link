"use client";

import { useLocale } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { formatDate, formatDateTime } from "./format";
import { STATUS_LABEL_KEY, STATUS_TONE } from "./status";
import { GlassCard, Pill } from "./primitives";

// Cards show only what helps a tenant pick a request: title, status and one line of context.
// Priority, assignee, notes and the description are on the detail page.

export function RepairCard({ item, categoryLabel }) {
  const { t, locale } = useLocale();
  const tone = STATUS_TONE[item.status] ?? "neutral";
  const scheduled = item.scheduled_at && (item.status === "open" || item.status === "in_progress");
  return (
    <Link href={`/maintenance/${item.id}`} className="block">
      <GlassCard className="flex flex-col gap-2.5 p-4 transition-transform active:scale-[0.99]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-on-surface">{item.title}</p>
            <p className="mt-0.5 truncate text-xs text-on-surface-variant">
              {[categoryLabel, formatDate(item.created_at, locale)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Pill tone={tone}>{t(STATUS_LABEL_KEY[item.status] ?? "portal_status_open")}</Pill>
        </div>
        {scheduled ? (
          <p className="flex items-center gap-1.5 text-xs text-cyan-200">
            <Icon name="schedule" className="text-[15px]" />
            {t("portal_visit_scheduled", { when: formatDateTime(item.scheduled_at, locale) })}
          </p>
        ) : null}
      </GlassCard>
    </Link>
  );
}

export function ComplaintCard({ item, categoryLabel }) {
  const { t, locale } = useLocale();
  const tone = STATUS_TONE[item.status] ?? "neutral";
  return (
    <Link href={`/complaints/${item.id}`} className="block">
      <GlassCard className="flex flex-col gap-2.5 p-4 transition-transform active:scale-[0.99]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-on-surface">{item.title}</p>
            <p className="mt-0.5 truncate text-xs text-on-surface-variant">
              {[categoryLabel, formatDate(item.created_at, locale)].filter(Boolean).join(" · ")}
            </p>
          </div>
          <Pill tone={tone}>{t(STATUS_LABEL_KEY[item.status] ?? "portal_status_open")}</Pill>
        </div>
      </GlassCard>
    </Link>
  );
}
