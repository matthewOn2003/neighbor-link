"use client";

import { useState } from "react";
import Image from "next/image";
import { useLocale } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { money } from "@/components/payments/shared";
import { useRequest } from "@/hooks/useRequest";
import { request } from "@/services/request";
import { ordinal, formatDate } from "@/components/portal/format";
import { BILL_LABEL_KEY, MAINTENANCE_ICON, REQUEST_STAGE, REQUEST_STAGE_TOTAL, useDictLabel } from "@/components/portal/status";
import { EmptyState, GlassCard, IconTile, LoadingBlock, Pill, ProgressBar } from "@/components/portal/primitives";

const CONTRACT_STATUS_KEY = {
  active: "contract_status_active",
  draft: "contract_status_draft",
  expired: "contract_status_expired",
  terminated: "contract_status_terminated",
};

export default function DashboardPage() {
  const { t, locale } = useLocale();
  const toast = useToast();
  const { data, loading } = useRequest("/tenant-portal/home", {});
  const dictLabel = useDictLabel(["maintenance_category"]);
  const [copying, setCopying] = useState(false);

  async function copyWifiKey() {
    setCopying(true);
    try {
      const wifi = await request("/tenant-portal/wifi", {});
      await navigator.clipboard.writeText(wifi?.wifi_password ?? "");
      toast.show(t("portal_wifi_copied"), "success");
    } catch {
      toast.show(t("portal_copy_failed"), "error");
    } finally {
      setCopying(false);
    }
  }

  if (loading && !data) return <LoadingBlock rows={4} />;
  if (!data) return <EmptyState icon="error" title={t("portal_load_failed")} />;

  const overdue = data.overdue_bill;
  const announcement = data.announcements?.[0];
  const unitLine = [data.property?.name, data.unit?.code].filter(Boolean).join(" · ");

  return (
    <div className="flex flex-col gap-5">
      <GlassCard className="relative overflow-hidden p-5">
        <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-secondary/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-3">
          <div className="min-w-0">
            {data.contract_status ? (
              <Pill tone={data.contract_status === "active" ? "emerald" : "neutral"} icon="verified">
                {t(CONTRACT_STATUS_KEY[data.contract_status] ?? "contract_status_active")}
              </Pill>
            ) : null}
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-on-surface">{t("portal_hello", { name: data.name })}</h1>
            {unitLine ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-on-surface-variant">
                <Icon name="home_pin" className="text-[16px] text-primary" />
                {unitLine}
              </p>
            ) : null}
          </div>
          <IconTile icon="apartment" tone="violet" />
        </div>
        <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
          <div className="flex min-w-0 items-center gap-2 rounded-xl border border-white/10 bg-black/30 px-3 py-2">
            <Icon name="wifi" className="text-[16px] text-primary" />
            <span className="truncate text-[11px] text-on-surface-variant">{t("wifi_ssid")}:</span>
            <span className="truncate text-xs font-bold text-on-surface">{data.property?.wifi_ssid || "-"}</span>
          </div>
          <button
            type="button"
            onClick={copyWifiKey}
            disabled={copying || !data.property?.wifi_ssid}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-bold text-on-surface hover:bg-white/[0.08] disabled:opacity-50"
          >
            <Icon name="content_copy" className="text-[14px]" />
            {t("portal_copy_key")}
          </button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("outstanding")}</span>
            <Icon name="account_balance_wallet" className="text-[18px] text-emerald-300" />
          </div>
          <p className="mt-3 text-lg font-extrabold text-on-surface">{money(data.outstanding_balance, locale)}</p>
          <div className="mt-1.5">
            {data.outstanding_balance > 0 ? (
              <Pill tone="amber">{t("portal_balance_due")}</Pill>
            ) : (
              <Pill tone="emerald" icon="verified">{t("portal_all_settled")}</Pill>
            )}
          </div>
        </GlassCard>
        <GlassCard className="relative overflow-hidden p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("monthly_rent")}</span>
            <Icon name="calendar_month" className="text-[18px] text-secondary" />
          </div>
          <p className="mt-3 text-lg font-extrabold text-secondary">{money(data.monthly_rent, locale)}</p>
          {data.billing_day ? (
            <p className="mt-1.5 flex items-center gap-1 text-[11px] text-on-surface-variant">
              <Icon name="event_repeat" className="text-[14px]" />
              {t("portal_due_monthly", { day: locale === "zh" ? data.billing_day : ordinal(data.billing_day) })}
            </p>
          ) : null}
        </GlassCard>
      </div>

      {overdue ? (
        <GlassCard className="flex items-center gap-3 border-rose-500/20 p-4">
          <IconTile icon="priority_high" tone="rose" size="sm" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-on-surface">{t("portal_notice_cycle", { period: overdue.billing_period })}</p>
            <p className="text-xs text-on-surface-variant">
              {money(overdue.outstanding, locale)} · {t(BILL_LABEL_KEY[overdue.display_status] ?? "bill_display_overdue")}
            </p>
          </div>
          <Link href="/billing" className="rounded-xl bg-white/[0.08] px-3 py-2 text-xs font-bold text-on-surface hover:bg-white/[0.12]">
            {t("portal_check")}
          </Link>
        </GlassCard>
      ) : null}

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t("quick_actions")}</span>
        </div>
        <div className="grid grid-cols-4 gap-2.5">
          <QuickAction href="/billing" icon="receipt_long" tone="violet" label={t("view_bills")} />
          <QuickAction href="/billing?sheet=proof" icon="upload_file" tone="gold" label={t("submit_payment_proof")} />
          <QuickAction href="/services?new=maintenance" icon="handyman" tone="rose" label={t("portal_action_repair")} />
          <QuickAction href="/services?new=complaint" icon="chat_bubble_outline" tone="cyan" label={t("portal_action_feedback")} />
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t("portal_active_requests")}</span>
          <Link href="/services" className="flex items-center gap-0.5 text-xs font-bold text-primary">
            {t("portal_see_all")}
            <Icon name="chevron_right" className="text-[16px]" />
          </Link>
        </div>
        {data.active_requests?.length ? (
          data.active_requests.map((item) => {
            const stage = REQUEST_STAGE[item.status] ?? 1;
            return (
              <Link key={item.id} href={`/maintenance/${item.id}`}>
                <GlassCard className="flex flex-col gap-3 p-4 transition-transform active:scale-[0.99]">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-3">
                      <IconTile icon={MAINTENANCE_ICON[item.category] ?? "build"} tone="violet" size="sm" />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-on-surface">{item.title}</p>
                        <p className="truncate text-[11px] text-on-surface-variant">
                          {[item.unit_code, dictLabel("maintenance_category", item.category)].filter(Boolean).join(" · ")}
                        </p>
                      </div>
                    </div>
                    <Pill tone={item.status === "open" ? "amber" : "cyan"}>{t(`portal_status_${item.status}`)}</Pill>
                  </div>
                  <div className="space-y-1.5">
                    <ProgressBar value={stage} max={REQUEST_STAGE_TOTAL} />
                    <div className="flex items-center justify-between text-xs text-on-surface-variant">
                      <span className="flex items-center gap-1">
                        <Icon name="schedule" className="text-[14px]" />
                        {item.assignee ? t("portal_assigned_to", { name: item.assignee }) : t("portal_awaiting_assignment")}
                      </span>
                      <span>{t("portal_stage", { current: stage, total: REQUEST_STAGE_TOTAL })}</span>
                    </div>
                  </div>
                </GlassCard>
              </Link>
            );
          })
        ) : (
          <GlassCard className="p-2">
            <EmptyState icon="task_alt" title={t("portal_no_active_requests")} />
          </GlassCard>
        )}
      </section>

      {announcement ? (
        <GlassCard className="flex gap-4 p-4">
          {announcement.image_url ? (
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 sm:h-20 sm:w-20">
              <Image src={announcement.image_url} alt="" fill sizes="80px" className="object-cover" unoptimized />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <Pill tone="gold">{t("portal_resident_note")}</Pill>
            <p className="mt-1.5 text-sm font-bold text-on-surface">{announcement.title}</p>
            <p className="mt-0.5 line-clamp-2 text-xs text-on-surface-variant">{announcement.body}</p>
            <p className="mt-1 text-[10px] text-on-surface-variant/70">{formatDate(announcement.published_at, locale)}</p>
          </div>
        </GlassCard>
      ) : null}
    </div>
  );
}

function QuickAction({ href, icon, tone, label }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 text-center">
      <IconTile icon={icon} tone={tone} />
      <span className="text-[10px] font-bold leading-tight text-on-surface-variant">{label}</span>
    </Link>
  );
}
