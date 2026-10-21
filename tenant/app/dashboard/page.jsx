"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { money } from "@/components/payments/shared";
import { useRequest } from "@/hooks/useRequest";
import { ordinal } from "@/components/portal/format";
import { BILL_LABEL_KEY, MAINTENANCE_ICON, REQUEST_STAGE, REQUEST_STAGE_TOTAL, useDictLabel } from "@/components/portal/status";
import { EmptyState, GlassCard, IconTile, LoadingBlock, Pill, ProgressBar } from "@/components/portal/primitives";

// The home screen answers one question: what do I need to do? Everything else lives in the other tabs.
const ATTENTION_LIMIT = 2;

export default function DashboardPage() {
  const { t, locale } = useLocale();
  const { data, loading } = useRequest("/tenant-portal/home", {});
  const dictLabel = useDictLabel(["maintenance_category"]);

  if (loading && !data) return <LoadingBlock rows={3} />;
  if (!data) return <EmptyState icon="error" title={t("portal_load_failed")} />;

  const overdue = data.overdue_bill;
  const requests = data.active_requests ?? [];
  const attention = [
    ...(overdue ? [{ key: `bill-${overdue.id}`, overdue }] : []),
    ...requests.map((item) => ({ key: `request-${item.id}`, request: item })),
  ].slice(0, ATTENTION_LIMIT);
  const unitLine = [data.property?.name, data.unit?.code].filter(Boolean).join(" · ");
  const billingDay = data.billing_day ? (locale === "zh" ? data.billing_day : ordinal(data.billing_day)) : null;

  return (
    <div className="flex flex-col gap-5">
      <GlassCard className="flex flex-col gap-4 p-5">
        <div className="min-w-0">
          <h1 className="text-lg font-extrabold tracking-tight text-on-surface">{t("portal_hello", { name: data.name })}</h1>
          {unitLine ? <p className="mt-0.5 truncate text-xs text-on-surface-variant">{unitLine}</p> : null}
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{t("outstanding")}</p>
          <p className="mt-1 text-3xl font-extrabold tracking-tight text-on-surface">{money(data.outstanding_balance, locale)}</p>
          <div className="mt-2">
            {data.outstanding_balance > 0 ? (
              <Pill tone="amber">{t("portal_balance_due")}</Pill>
            ) : (
              <Pill tone="emerald" icon="verified">{t("portal_all_settled")}</Pill>
            )}
          </div>
        </div>

        {data.monthly_rent || billingDay ? (
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-white/[0.08] pt-3 text-xs text-on-surface-variant">
            {data.monthly_rent ? <span>{t("monthly_rent")}: {money(data.monthly_rent, locale)}</span> : null}
            {billingDay ? (
              <span className="flex items-center gap-1">
                <Icon name="event_repeat" className="text-[14px]" />
                {t("portal_due_monthly", { day: billingDay })}
              </span>
            ) : null}
          </p>
        ) : null}
      </GlassCard>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t("portal_needs_attention")}</span>
          {requests.length > 0 ? (
            <Link href="/services" className="flex items-center gap-0.5 text-xs font-bold text-primary">
              {t("portal_see_all")}
              <Icon name="chevron_right" className="text-[16px]" />
            </Link>
          ) : null}
        </div>

        {attention.length === 0 ? (
          <GlassCard className="p-2">
            <EmptyState icon="task_alt" title={t("portal_nothing_pending")} />
          </GlassCard>
        ) : null}

        {attention.map(({ key, overdue: bill, request: item }) =>
          bill ? (
            <Link key={key} href="/billing">
              <GlassCard className="flex items-center gap-3 border-rose-500/20 p-4 transition-transform active:scale-[0.99]">
                <IconTile icon="priority_high" tone="rose" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-on-surface">{t("portal_notice_cycle", { period: bill.billing_period })}</p>
                  <p className="text-xs text-on-surface-variant">
                    {money(bill.outstanding, locale)} · {t(BILL_LABEL_KEY[bill.display_status] ?? "bill_display_overdue")}
                  </p>
                </div>
                <Icon name="chevron_right" className="text-[18px] text-on-surface-variant" />
              </GlassCard>
            </Link>
          ) : (
            <Link key={key} href={`/maintenance/${item.id}`}>
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
                  <ProgressBar value={REQUEST_STAGE[item.status] ?? 1} max={REQUEST_STAGE_TOTAL} />
                  <p className="text-right text-xs text-on-surface-variant">
                    {t("portal_stage", { current: REQUEST_STAGE[item.status] ?? 1, total: REQUEST_STAGE_TOTAL })}
                  </p>
                </div>
              </GlassCard>
            </Link>
          ),
        )}
      </section>

      <section className="flex flex-col gap-2.5">
        <span className="px-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{t("quick_actions")}</span>
        <div className="grid grid-cols-2 gap-3">
          <QuickAction href="/billing?sheet=proof" icon="upload_file" tone="gold" label={t("submit_payment_proof")} />
          <QuickAction href="/services?new=maintenance" icon="handyman" tone="rose" label={t("portal_action_repair")} />
        </div>
      </section>
    </div>
  );
}

function QuickAction({ href, icon, tone, label }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-surface-container-low p-3.5 transition-transform active:scale-[0.99]">
      <IconTile icon={icon} tone={tone} size="sm" />
      <span className="text-sm font-bold text-on-surface">{label}</span>
    </Link>
  );
}
