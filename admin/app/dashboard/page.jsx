"use client";

import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { useDashboardOverview } from "@/hooks/useDashboardOverview";
import { useLocale } from "@/i18n";

const money = (value) => `RM ${Number(value || 0).toLocaleString("en-MY", { maximumFractionDigits: 0 })}`;

export default function DashboardPage() {
  const { t } = useLocale();
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
            <span>{t("try_again")}</span>
          </button>
        </div>
      </div>
    );
  }

  const { summary, properties = [] } = data;
  const cards = [
    ["Occupancy", `${summary.occupancyRate}%`, `${summary.occupiedUnits} / ${summary.totalUnits} units`],
    ["Vacant units", String(summary.vacantUnits), `${summary.activeLeases} active leases`],
    ["Collected this cycle", money(summary.cycleCollectedAmount), `of ${money(summary.cycleBilledAmount)} billed`],
    ["Outstanding this cycle", money(summary.cycleOutstandingAmount), `${summary.openBills} open bills`],
    ["Overdue", money(summary.cycleOverdueAmount), `${summary.cycleOverdueCount} bills past due`],
    ["Proofs to review", String(summary.pendingProofCount), `${money(summary.pendingProofAmount)} claimed`],
    ["Open maintenance", String(summary.openMaintenance), `${summary.urgentMaintenance} urgent`],
    ["New requests this week", String(summary.maintenanceNewWeek), `${summary.maintenanceNewTenant} from tenants · ${summary.maintenanceNewAdmin} from admin`],
    ["Open complaints", String(summary.openComplaints), "tenant complaints in progress"],
    ["Leases ending in 60 days", String(summary.contractsExpiring60d), `${summary.contractsExpiring30d} within 30 days`],
  ];

  return (
    <main className="flex w-full flex-col gap-6 p-4 md:p-8">
      <header>
        <h1 className="text-3xl font-semibold text-scene-content">{t("dashboard")}</h1>
        <p className="mt-1 text-sm text-subtle">Portfolio health, cash collection and operational queue.</p>
      </header>
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value, sub]) => (
          <div key={label} className="rounded-2xl border border-line/50 bg-accent p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase text-subtle">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-scene-content">{value}</p>
            <p className="mt-1 text-xs text-subtle">{sub}</p>
          </div>
        ))}
      </section>
      <section className="rounded-2xl border border-line/50 bg-accent p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-scene-content">Properties</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-subtle">
              <tr>
                <th className="py-2 pr-4 font-semibold">Property</th>
                <th className="py-2 pr-4 font-semibold">Units</th>
                <th className="py-2 pr-4 font-semibold">Occupied</th>
                <th className="py-2 pr-4 font-semibold">Vacant</th>
                <th className="py-2 pr-4 font-semibold">Under maintenance</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-t border-line/50">
                  <td className="py-2 pr-4 text-scene-content">{p.name}</td>
                  <td className="py-2 pr-4">{p.totalUnits}</td>
                  <td className="py-2 pr-4">{p.occupiedUnits}</td>
                  <td className="py-2 pr-4">{p.totalUnits - p.occupiedUnits - p.maintenanceUnits}</td>
                  <td className="py-2 pr-4">{p.maintenanceUnits}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
