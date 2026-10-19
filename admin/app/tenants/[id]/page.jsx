"use client";

import { use } from "react";
import { useRequest } from "@/hooks/useRequest";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";

const money = (value) => value == null
  ? "—"
  : `RM ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function DetailField({ label, value }) {
  return (
    <div className="rounded-lg bg-primary/5 p-4">
      <dt className="text-xs font-semibold uppercase text-subtle">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-scene-content">{value || "—"}</dd>
    </div>
  );
}

export default function TenantDetailPage({ params }) {
  const { id } = use(params);
  const { data: tenant, loading, error } = useRequest(`/tenant/detail/${id}`);

  if (loading) {
    return <main className="p-4 md:p-8"><div className="flex min-h-48 items-center justify-center"><Spinner size="lg" /></div></main>;
  }

  if (error || !tenant) {
    return (
      <main className="p-4 md:p-8">
        <div role="alert" className="rounded-xl border border-error/30 bg-error/5 p-5">
          <h1 className="font-semibold text-scene-content">Unable to load tenant</h1>
          <p className="mt-1 text-sm text-subtle">{error || "Tenant not found."}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col">
      <div className="space-y-6 p-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Tenant management</p>
            <h1 className="mt-1 text-2xl font-semibold text-scene-content">{tenant.name}</h1>
            <p className="mt-1 text-sm text-subtle">Tenant #{tenant.id}</p>
          </div>
          <span className={`status-pill ${tenant.status === "active" ? "success" : "neutral"}`}>
            {tenant.status || "Unknown"}
          </span>
        </header>

        <section className="rounded-xl bg-accent p-6 shadow">
          <div className="mb-4 flex items-center gap-2">
            <Icon name="badge" className="text-xl text-primary-dark" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-scene-content">Tenant details</h2>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <DetailField label="Full name" value={tenant.name} />
            <DetailField label="Phone" value={tenant.phone} />
            <DetailField label="Email" value={tenant.email} />
            <DetailField label="Property" value={tenant.property_name} />
            <DetailField label="Property ID" value={tenant.property_id} />
            <DetailField label="Unit ID" value={tenant.unit_id} />
            <DetailField label="Contract end" value={tenant.contract_end} />
            <DetailField label="Monthly rent" value={money(tenant.monthly_rent)} />
            <DetailField label="Outstanding balance" value={money(tenant.outstanding_balance)} />
            <DetailField label="Balance note" value={tenant.balance_note} />
            <DetailField label="City" value={tenant.city} />
            <DetailField label="Last updated" value={tenant.updated_at ? new Date(tenant.updated_at).toLocaleString() : null} />
          </dl>
        </section>
      </div>
    </main>
  );
}
