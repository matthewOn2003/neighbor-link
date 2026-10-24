"use client";

import Link from "next/link";
import { useState } from "react";
import { EmptyState, Icon, Spinner, Select } from "@/components/ui";
import { useApiData } from "@/hooks/useApiData";
import { useLocale } from "@/i18n";
import { formatMoney } from "@/utils/format";
import { indexBy } from "@/utils/collections";
import { formatMonth } from "@/utils/date";

const money = (value) => formatMoney(value, "en-MY", { digits: 0 });
const pct = (value, digits = 1) => `${Number(value || 0).toFixed(digits)}%`;
const share = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);
const clamp = (value) => Math.min(Math.max(Number(value) || 0, 0), 100);


function Panel({ eyebrow, title, badge, children, footer }) {
  return (
    <div className="flex flex-col justify-between card">
      <div>
        <div className="flex items-center justify-between border-b border-line/40 pb-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">{eyebrow}</p>
            <h3 className="mt-0.5 text-base font-semibold text-scene-content">{title}</h3>
          </div>
          {badge}
        </div>
        {children}
      </div>
      {footer ? <div className="mt-4 border-t border-line/40 pt-3 text-xs text-subtle">{footer}</div> : null}
    </div>
  );
}

function Gauge({ value }) {
  return (
    <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90">
      <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="3.5" style={{ stroke: "var(--line)" }} opacity="0.4" />
      <circle
        cx="18"
        cy="18"
        r="15.9155"
        fill="none"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeDasharray={`${clamp(value)}, 100`}
        style={{ stroke: "var(--primary)" }}
      />
    </svg>
  );
}

function Donut({ segments }) {
  // Each segment starts where the previous one ended; offsets are computed before rendering.
  const arcs = segments.reduce(
    (list, seg) => {
      const start = list.next;
      list.items.push({ ...seg, offset: 25 - start });
      list.next = start + seg.pct;
      return list;
    },
    { items: [], next: 0 },
  ).items;

  return (
    <svg viewBox="0 0 42 42" className="h-36 w-36 -rotate-90">
      <circle cx="21" cy="21" r="15.9155" fill="transparent" strokeWidth="5.5" style={{ stroke: "var(--line)" }} opacity="0.25" />
      {arcs.map((arc) => (
        <circle
          key={arc.label}
          cx="21"
          cy="21"
          r="15.9155"
          fill="transparent"
          strokeWidth="5.5"
          strokeDasharray={`${arc.pct} ${100 - arc.pct}`}
          strokeDashoffset={arc.offset}
          style={{ stroke: arc.color }}
        />
      ))}
    </svg>
  );
}

export default function DashboardPage() {
  const { t } = useLocale();
  const [selectedCycle, setSelectedCycle] = useState("");
  // Empty cycle -> undefined -> dropped by JSON.stringify, so the server returns the current cycle.
  const { data, loading, error, reload } = useApiData("/dashboard/overview", {
    cycle: selectedCycle || undefined,
  });

  if (loading && !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="card">
          <EmptyState
            title="Could not load the dashboard."
            action={
              <button type="button" className="btn btn-outline" onClick={reload}>
                <Icon name="refresh" className="text-lg" />
                <span>{t("try_again")}</span>
              </button>
            }
          />
        </div>
      </div>
    );
  }

  const s = data.summary;
  const funnel = indexBy(data.collectionFunnel || [], (g) => g.id);
  const outstanding = s.cycleOutstandingAmount;
  const overdueAmount = s.cycleOverdueAmount;
  const dueAmount = Math.max(outstanding - overdueAmount, 0);
  const dueCount = (funnel.unpaid?.count || 0) + (funnel.partial?.count || 0);
  const realizedPct = share(s.cycleCollectedAmount, s.cycleBilledAmount);
  const occupancyDelta = s.occupancyRate - s.occupancyRatePrevMonth;
  const vacantExcludingMaintenance = Math.max(s.vacantUnits - s.maintenanceUnits, 0);
  const cycleLabel = formatMonth(data.cycle, "en-US").toUpperCase();

  const donutSegments = [
    { label: "Occupied", pct: share(s.occupiedUnits, s.totalUnits), color: "var(--primary)" },
    { label: "Vacant", pct: share(vacantExcludingMaintenance, s.totalUnits), color: "var(--line)" },
    { label: "Maintenance", pct: share(s.maintenanceUnits, s.totalUnits), color: "var(--error)" },
  ];

  const sixMonths = (data.revenue || []).slice(-6).map((point) => ({
    ...point,
    realized: point.rent + point.extra,
  }));
  const barMax = Math.max(1, ...sixMonths.flatMap((p) => [p.billed, p.realized]));

  const properties = (data.properties || [])
    .map((p) => ({ ...p, rate: share(p.occupiedUnits, p.totalUnits) }))
    .sort((a, b) => b.rate - a.rate);

  const queue = [
    {
      label: "Proofs To Review",
      icon: "verified",
      value: s.pendingProofCount,
      pill: `${money(s.pendingProofAmount)} Claimed`,
      footer: s.pendingProofCount > 0 ? "Awaiting review" : "All cleared",
      footerClass: s.pendingProofCount > 0 ? "text-highlight" : "text-success",
    },
    {
      label: "Open Maintenance",
      icon: "build",
      value: s.openMaintenance,
      pill: `${Math.max(s.openMaintenance - s.urgentMaintenance, 0)} Standard`,
      footer: `${s.urgentMaintenance} urgent tickets`,
      footerClass: s.urgentMaintenance > 0 ? "text-error" : "text-subtle",
    },
    {
      label: "New Requests",
      icon: "assignment_add",
      value: s.maintenanceNewWeek,
      pill: "This Week",
      footer: `${s.maintenanceNewTenant} tenant · ${s.maintenanceNewAdmin} admin`,
      footerClass: "text-subtle",
    },
    {
      label: "Open Complaints",
      icon: "support_agent",
      value: s.openComplaints,
      pill: "In Progress",
      footer: `${s.complaintsOverSla} over SLA`,
      footerClass: s.complaintsOverSla > 0 ? "text-error" : "text-subtle",
    },
    {
      label: "Lease Expiries (60d)",
      icon: "contract_edit",
      value: s.contractsExpiring60d,
      pill: s.contractsExpiring30d > 0 ? "Expiring" : "Stable",
      footer: `${s.contractsExpiring30d} within 30 days`,
      footerClass: s.contractsExpiring30d > 0 ? "text-highlight" : "text-success",
    },
  ];

  return (
    <div className={`flex w-full flex-col gap-6 p-4 pb-16 md:p-8 ${loading ? "opacity-60 transition-opacity" : ""}`}>
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-scene-content">{t("dashboard")}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              {cycleLabel} CYCLE
            </span>
          </div>
          <p className="mt-1 text-sm text-subtle">Portfolio health, cash collection and operational queue.</p>
        </div>
        <label className="flex items-center gap-2 rounded-lg border border-line/40 bg-accent px-3.5 py-2 text-sm font-medium text-scene-content shadow-sm">
          <Icon name="calendar_month" className="text-lg text-primary" />
          <span className="sr-only">Billing cycle</span>
          <Select
            variant="filter"
            name="cycle"
            label={t("cycle")}
            value={selectedCycle || data.cycle}
            onChange={setSelectedCycle}
            options={data.cycles ?? []}
          />
        </label>
      </header>

      {/* Hero KPIs */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="relative overflow-hidden card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Occupancy Rate</p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight text-scene-content">{pct(s.occupancyRate)}</span>
                {s.totalUnits > 0 ? (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${occupancyDelta >= 0 ? "bg-success/15 text-success" : "bg-error/10 text-error"
                      }`}
                  >
                    {occupancyDelta >= 0 ? "+" : ""}
                    {occupancyDelta.toFixed(1)}%
                  </span>
                ) : null}
              </div>
            </div>
            <div className="relative flex h-14 w-14 items-center justify-center">
              <Gauge value={s.occupancyRate} />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-scene px-2.5 py-1.5 text-xs text-subtle">
            <span className="flex items-center gap-1 font-semibold text-scene-content">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {s.occupiedUnits} / {s.totalUnits} Units
            </span>
            <span className="font-medium text-error">{s.vacantUnits} Vacant</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Collected This Cycle</p>
              <p className="mt-2 text-3xl font-bold text-scene-content">{money(s.cycleCollectedAmount)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/15 text-success">
              <Icon name="account_balance_wallet" className="text-[22px]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-semibold uppercase">
              <span className="text-subtle">{pct(realizedPct)} Realized</span>
              <span className="text-subtle">Target: {money(s.cycleBilledAmount)}</span>
            </div>
            <div className="flex h-2 w-full overflow-hidden rounded-full bg-line/30">
              <div className="h-full rounded-full bg-success" style={{ width: `${clamp(realizedPct)}%` }} />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs">
            <span className="text-subtle">Remaining to collect</span>
            <span className="font-semibold text-scene-content">{money(outstanding)}</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Outstanding This Cycle</p>
              <p className="mt-2 text-3xl font-bold text-scene-content">{money(outstanding)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Icon name="pending_actions" className="text-[22px]" />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg bg-scene px-2.5 py-1.5 text-xs">
            <span className="text-subtle">{s.openBills} Open Invoices</span>
            <Link href="/bills" className="flex items-center gap-0.5 font-semibold text-primary hover:underline">
              Review List <Icon name="arrow_forward" className="text-sm" />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden card">
          <div className="absolute inset-y-0 right-0 w-1.5 bg-error" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-error">Overdue In Arrears</p>
              <p className="mt-2 text-3xl font-bold text-error">{money(overdueAmount)}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-error/10 text-error">
              <Icon name="warning" className="text-[22px]" />
            </div>
          </div>
          <div className="mt-4 flex items-center rounded-lg bg-error/10 px-2.5 py-1.5 text-xs font-semibold text-error">
            <span className="flex items-center gap-1">
              <Icon name="priority_high" className="text-[15px]" />
              {s.cycleOverdueCount} Bills Past Due
            </span>
          </div>
        </div>
      </section>

      {/* Analytics */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Panel
          eyebrow="Unit Capacity Analytics"
          title="Occupancy Breakdown"
          badge={
            <span className="rounded-full bg-scene px-2 py-0.5 text-[11px] font-semibold uppercase text-subtle">
              {s.totalUnits} Units
            </span>
          }
          footer={
            <div className="flex items-center justify-between">
              <span>Portfolio Target: {pct(s.occupancyTarget, 0)}</span>
              <span className="font-semibold text-primary">{s.unitsToTarget} Units to Target</span>
            </div>
          }
        >
          <div className="flex flex-col items-center justify-center gap-6 py-5 sm:flex-row">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <Donut segments={donutSegments} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[22px] font-bold leading-none text-scene-content">{pct(s.occupancyRate)}</span>
                <span className="mt-0.5 text-[10px] uppercase text-subtle">Leased</span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-2.5 sm:w-auto">
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-primary" />
                  <span className="font-medium text-scene-content">Occupied</span>
                </div>
                <span className="font-semibold text-scene-content">
                  {s.occupiedUnits} <span className="text-[11px] font-normal text-subtle">({pct(share(s.occupiedUnits, s.totalUnits))})</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-line" />
                  <span className="font-medium text-subtle">Vacant</span>
                </div>
                <span className="font-semibold text-scene-content">
                  {vacantExcludingMaintenance}{" "}
                  <span className="text-[11px] font-normal text-subtle">({pct(share(vacantExcludingMaintenance, s.totalUnits))})</span>
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-sm bg-error" />
                  <span className="font-medium text-error">Maintenance</span>
                </div>
                <span className="font-semibold text-error">
                  {s.maintenanceUnits}{" "}
                  <span className="text-[11px] font-normal">({pct(share(s.maintenanceUnits, s.totalUnits))})</span>
                </span>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          eyebrow="Revenue Realization"
          title="Billing vs Collection"
          badge={
            <span className="rounded-full bg-success/15 px-2 py-0.5 text-[11px] font-semibold uppercase text-success">
              {money(s.cycleBilledAmount)} Target
            </span>
          }
          footer={
            s.cycleOverdueCount > 0 ? (
              <span className="flex items-center gap-1 font-medium text-error">
                <Icon name="trending_down" className="text-[15px]" />
                Recovery Alert
              </span>
            ) : null
          }
        >
          <div className="py-4">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-sm font-medium text-subtle">Cycle Realization Ratio</span>
              <span className="text-xl font-bold text-success">{pct(realizedPct)}</span>
            </div>
            <div className="flex h-4 w-full overflow-hidden rounded-lg bg-line/30 shadow-inner">
              <div className="h-full bg-success" style={{ width: `${clamp(share(s.cycleCollectedAmount, s.cycleBilledAmount))}%` }} title={`Collected: ${money(s.cycleCollectedAmount)}`} />
              <div className="h-full bg-primary/40" style={{ width: `${clamp(share(dueAmount, s.cycleBilledAmount))}%` }} title={`Due: ${money(dueAmount)}`} />
              <div className="h-full bg-error" style={{ width: `${clamp(share(overdueAmount, s.cycleBilledAmount))}%` }} title={`Overdue: ${money(overdueAmount)}`} />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] font-semibold uppercase text-subtle">
              <span>RM 0</span>
              <span>{money(s.cycleBilledAmount)} Total</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 pt-2">
              <div className="flex flex-col rounded-lg border border-success/30 bg-success/10 p-2.5">
                <span className="text-[10px] font-bold uppercase text-success">Realized</span>
                <span className="mt-0.5 text-[15px] font-bold text-success">{money(s.cycleCollectedAmount)}</span>
                <span className="text-[10px] text-subtle">{pct(realizedPct)} of cycle</span>
              </div>
              <div className="flex flex-col rounded-lg border border-primary/20 bg-primary/5 p-2.5">
                <span className="text-[10px] font-bold uppercase text-primary">Due Window</span>
                <span className="mt-0.5 text-[15px] font-bold text-scene-content">{money(dueAmount)}</span>
                <span className="text-[10px] text-subtle">{dueCount} Invoices</span>
              </div>
              <div className="flex flex-col rounded-lg border border-error/20 bg-error/10 p-2.5">
                <span className="text-[10px] font-bold uppercase text-error">Overdue</span>
                <span className="mt-0.5 text-[15px] font-bold text-error">{money(overdueAmount)}</span>
                <span className="text-[10px] font-medium text-error">{s.cycleOverdueCount} In Arrears</span>
              </div>
            </div>
          </div>
        </Panel>

        <Panel
          eyebrow="Historical Trend"
          title="6-Month Collection Velocity"
          badge={
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase text-subtle">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-line" /> Billed
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" /> Realized
              </span>
            </div>
          }
        >
          <div className="flex h-44 items-end justify-between gap-2 px-1 pt-6">
            {sixMonths.map((point) => {
              const current = point.month === data.cycle;
              return (
                <div
                  key={point.month}
                  className={`flex h-full flex-1 flex-col items-center justify-end gap-1 rounded-lg ${current ? "bg-primary/5" : ""}`}
                >
                  <div className="flex h-[85%] w-full max-w-[28px] items-end justify-center gap-1">
                    <div
                      className="w-1/2 rounded-t bg-line"
                      style={{ height: `${(point.billed / barMax) * 100}%` }}
                      title={`${point.month} billed: ${money(point.billed)}`}
                    />
                    <div
                      className="w-1/2 rounded-t bg-success"
                      style={{ height: `${(point.realized / barMax) * 100}%` }}
                      title={`${point.month} realized: ${money(point.realized)}`}
                    />
                  </div>
                  <span className={`text-[10px] font-semibold ${current ? "text-primary" : "text-subtle"}`}>
                    {formatMonth(point.month, "en-US", { month: "short" }).toUpperCase()}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>
      </section>

      {/* Operational queue */}
      <section>
        <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Icon name="tune" className="text-xl text-primary" />
            <h2 className="text-base font-semibold text-scene-content">Operational Queue &amp; Work Order Allocation</h2>
          </div>
          <span className="text-xs font-semibold text-subtle">
            Average Resolution Time: <strong className="text-scene-content">{s.avgResolutionDays.toFixed(1)} days</strong>
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 lg:grid-cols-5">
          {queue.map((item) => (
            <div
              key={item.label}
              className="flex flex-col justify-between rounded-xl border border-transparent bg-accent p-3.5 shadow-sm transition-all hover:border-line/60"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{item.label}</span>
                <Icon name={item.icon} className="text-lg text-primary" />
              </div>
              <div className="my-2 flex items-baseline justify-between gap-2">
                <span className="text-2xl font-bold text-scene-content">{item.value}</span>
                <span className="rounded-full bg-scene px-2 py-0.5 text-[10px] font-semibold uppercase text-subtle">{item.pill}</span>
              </div>
              <div className={`flex items-center gap-1 text-xs font-semibold ${item.footerClass}`}>{item.footer}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Property benchmark */}
      <section className="card">
        <div className="mb-4 flex flex-col gap-2 border-b border-line/40 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-subtle">Property Portfolio Benchmark</p>
            <h3 className="mt-0.5 text-base font-semibold text-scene-content">Occupancy Rate by Property</h3>
          </div>
          {properties.length > 0 ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-1 text-[11px] font-bold uppercase text-success">
                <Icon name="star" className="text-sm" /> Top: {properties[0].name} ({pct(properties[0].rate)})
              </span>
              <span className="inline-flex items-center rounded-full bg-error/10 px-2.5 py-1 text-[11px] font-semibold uppercase text-error">
                Low: {properties[properties.length - 1].name} ({pct(properties[properties.length - 1].rate)})
              </span>
            </div>
          ) : null}
        </div>
        <div className="grid grid-cols-1 gap-x-8 gap-y-3 md:grid-cols-2">
          {properties.map((p, index) => {
            const color = index === 0 ? "bg-success" : p.rate < 10 ? "bg-error" : "bg-primary";
            return (
              <div key={p.id} className="flex items-center gap-3">
                <span className="w-28 truncate text-[11px] font-semibold uppercase text-scene-content" title={p.name}>
                  {p.name}
                </span>
                <div className="flex h-3 flex-1 overflow-hidden rounded-full bg-line/30">
                  <div className={`h-full rounded-full ${color}`} style={{ width: `${clamp(p.rate)}%` }} />
                </div>
                <span className="w-14 text-right text-xs font-semibold text-scene-content">{pct(p.rate)}</span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}