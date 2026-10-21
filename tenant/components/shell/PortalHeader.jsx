"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "@/i18n";
import LangSelect from "@/components/LangSelect";
import { Icon } from "@/components/ui/Icon";
import { useRequest } from "@/hooks/useRequest";
import NotificationSheet from "@/components/portal/NotificationSheet";

function initialsOf(name) {
  const parts = String(name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function PortalHeader({ subtitleKey }) {
  const { t } = useLocale();
  const { data } = useRequest("/tenant-portal/me", {});
  const notices = useRequest("/tenant-portal/notification/list", { current_page: 1, per_page: 1 });
  const [open, setOpen] = useState(false);
  const unread = notices.data?.summary?.unread_count ?? 0;

  return (
    <>
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-background/80 pt-safe backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-lg items-center justify-between gap-3 px-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-gradient-to-br from-surface-container-high to-surface-container-low p-1.5 shadow-inner">
            <Image src="/stitch/logo.png" alt={t("brand_name")} width={28} height={28} className="h-full w-full object-contain" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-[17px] font-bold leading-none tracking-tight text-on-surface">NeighborLink</span>
            <span className="mt-0.5 truncate text-[11px] font-medium tracking-wide text-on-surface-variant">{t(subtitleKey)}</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            aria-label={t("portal_notifications")}
            onClick={() => setOpen(true)}
            className="relative grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-on-surface transition-colors hover:bg-white/[0.08]"
          >
            <Icon name="notifications" className="text-[20px]" />
            {unread > 0 ? <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-secondary" /> : null}
          </button>
          <LangSelect />
          <div
            aria-label={data?.name ?? t("profile")}
            title={data?.name ?? ""}
            className="grid h-9 w-9 place-items-center rounded-full border border-primary/30 bg-primary/15 text-xs font-bold text-primary"
          >
            {initialsOf(data?.name)}
          </div>
        </div>
      </div>
    </header>
    {open ? <NotificationSheet onClose={() => setOpen(false)} onChanged={notices.reload} /> : null}
    </>
  );
}
