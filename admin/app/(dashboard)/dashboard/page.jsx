"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useApi } from "@/lib/useApi";
import { PageHeader } from "@/app/components/ui";

const cardStyle = {
  padding: "var(--panel-padding)",
  borderRadius: "var(--panel-radius)",
  background: "var(--panel-background)",
  border: "var(--border-width) solid var(--panel-border)",
  boxShadow: "var(--panel-shadow)",
};

export default function DashboardPage() {
  const request = useApi();
  const [propertyTotal, setPropertyTotal] = useState(null);
  const [tenantTotal, setTenantTotal] = useState(null);

  useEffect(() => {
    request("/property/list?current_page=1&per_page=1", undefined, { method: "GET" })
      .then((res) => setPropertyTotal(res.data.pagination.total))
      .catch(() => setPropertyTotal(0));
    request("/tenant/list?current_page=1&per_page=1", undefined, { method: "GET" })
      .then((res) => setTenantTotal(res.data.pagination.total))
      .catch(() => setTenantTotal(0));
  }, []);

  return (
    // <main aria-label="Admin dashboard" style={{ padding: "var(--page-padding-block) var(--page-padding-inline)" }}>
    <main aria-label="Admin dashboard" className="page-container page-container-lg">
      <PageHeader title="Dashboard" description="Overview of properties and tenants." />
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <div style={cardStyle}>
          <p style={{ color: "var(--ink-muted)", fontSize: "0.875rem", margin: 0 }}>
            Properties
          </p>
          <p style={{ fontSize: "2rem", fontWeight: 700, margin: "0.25rem 0 0" }}>
            {propertyTotal ?? "—"}
          </p>
          <Link
            href="/properties"
            className="btn btn-secondary btn-sm"
            style={{ marginTop: "0.75rem", display: "inline-flex" }}
          >
            View properties
          </Link>
        </div>
        <div style={cardStyle}>
          <p style={{ color: "var(--ink-muted)", fontSize: "0.875rem", margin: 0 }}>
            Tenants
          </p>
          <p style={{ fontSize: "2rem", fontWeight: 700, margin: "0.25rem 0 0" }}>
            {tenantTotal ?? "—"}
          </p>
          <Link
            href="/tenants"
            className="btn btn-secondary btn-sm"
            style={{ marginTop: "0.75rem", display: "inline-flex" }}
          >
            View tenants
          </Link>
        </div>
      </div>
    </main>
  );
}
