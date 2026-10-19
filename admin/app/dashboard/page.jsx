"use client";

import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";

const money = (value) => `RM ${Number(value || 0).toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;

export default function DashboardPage() {
  const { data, loading, error, reload } = useDashboardOverview();

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
        <div className="rounded-2xl bg-accent p-8 text-center shadow">
          <p className="text-sm text-error">Could not load the dashboard.</p>
          <button type="button" className="btn btn-outline mt-4" onClick={reload}>
            <Icon name="refresh" className="text-lg" />
            <span>Try again</span>
          </button>
        </div>
      </div>
    );
  }

  const { summary } = data;
  const cards = [
    ["Occupancy", `${summary.occupancyRate}%`, `${summary.occupiedUnits} / ${summary.totalUnits} units`],
    ["Collected this cycle", money(summary.cycleCollectedAmount), `of ${money(summary.cycleBilledAmount)} billed`],
    ["Overdue", money(summary.cycleOverdueAmount), `${summary.cycleOverdueCount} bills past due`],
    ["Leases ending in 60 days", String(summary.contractsExpiring60d), `${summary.contractsExpiring30d} within 30 days`],
  ];

  return (
    <main className="flex w-full flex-col gap-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-semibold text-scene-content">Dashboard</h1>
        <p className="mt-1 text-sm text-subtle">Portfolio health, cash collection and operational queue.</p>
      </header>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value, sub]) => (
          <div key={label} className="rounded-2xl border border-line/50 bg-accent p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-subtle">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-scene-content">{value}</p>
            <p className="mt-1 text-xs text-subtle">{sub}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
