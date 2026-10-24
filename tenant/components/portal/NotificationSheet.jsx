"use client";

import { useLocale } from "@/i18n";
import { api } from "@/services/api";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { request, useApiRequest } from "@/hooks/useApiRequest";
import { formatDateTime } from "./format";
import { EmptyState, GhostButton, LoadingBlock, Sheet } from "./primitives";

const KIND_ICON = { billing: "receipt", announcement: "campaign", maintenance: "build", complaint: "report" };

/** The notification bell's list. Opening an item marks it read; "mark all" clears the badge. */
export default function NotificationSheet({ onClose, onChanged }) {
  const { t, locale } = useLocale();
  const toast = useToast();
  const list = useApiRequest(api.notification.list, { current_page: 1, per_page: 50 });
  const items = list.data?.list ?? [];
  const unread = list.data?.summary?.unread_count ?? 0;

  async function markRead(params) {
    try {
      await request(api.notification.read, params);
      list.reload();
      onChanged();
    } catch {
      toast.error(t("portal_request_failed"));
    }
  }

  const footer = (
    <>
      <GhostButton onClick={onClose}>{t("close")}</GhostButton>
      <GhostButton onClick={() => markRead({ all: true })} disabled={unread === 0}>
        <Icon name="done_all" className="text-[18px]" />
        {t("portal_mark_all_read")}
      </GhostButton>
    </>
  );

  return (
    <Sheet open onClose={onClose} icon="notifications" title={t("portal_notifications")} footer={footer}>
      {list.loading && !list.data ? <LoadingBlock rows={3} /> : null}
      {list.data && items.length === 0 ? <EmptyState icon="notifications_off" title={t("portal_no_notifications")} /> : null}
      {items.length > 0 ? (
        <ul className="flex flex-col gap-2.5">
          {items.map((item) => {
            const unreadItem = !item.read_at;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => unreadItem && markRead({ id: item.id })}
                  className="flex w-full items-start gap-3 rounded-xl border border-white/[0.06] bg-black/30 p-3.5 text-left"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
                    <Icon name={KIND_ICON[item.kind] ?? "notifications"} className="text-[18px]" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className={`truncate text-sm ${unreadItem ? "font-bold text-on-surface" : "font-semibold text-on-surface-variant"}`}>
                        {item.title}
                      </span>
                      {unreadItem ? <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" /> : null}
                    </span>
                    {item.body ? <span className="mt-0.5 block text-xs text-on-surface-variant">{item.body}</span> : null}
                    <span className="mt-1.5 block text-[10px] text-on-surface-variant/80">{formatDateTime(item.created_at, locale)}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </Sheet>
  );
}
