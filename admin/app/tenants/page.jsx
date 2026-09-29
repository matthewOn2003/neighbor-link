"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProperties } from "@/lib/useProperties";
import { PageHeader, DataTable, Badge } from "@/app/components/ui";
import { fds } from "@/lib/date";

export default function TenantsPage() {
  const { properties } = useProperties();

  // property_id -> property name
  const propertyNames = useMemo(
    () => Object.fromEntries(properties.map((p) => [p.id, p.name])),
    [properties],
  );

  return (
    <div className="page-container page-container-lg">
      <PageHeader
        title="Tenants"
        description="Manage tenant accounts and their property assignments."
        actions={
          <Link href="/tenants/new" className="btn btn-primary">
            New tenant
          </Link>
        }
      />

      <DataTable
        api="/tenant/list"
        columns={8}
        emptyTitle="No tenants yet"
        emptyDescription="Create your first tenant to get started."
        head={
          <>
            <th className="table-head-cell">ID</th>
            <th className="table-head-cell">Name</th>
            <th className="table-head-cell">Phone</th>
            <th className="table-head-cell">Email</th>
            <th className="table-head-cell">User ID</th>
            <th className="table-head-cell">Property</th>
            <th className="table-head-cell">Status</th>
            <th className="table-head-cell">Created</th>
          </>
        }
      >
        {(row) => (
          <tr className="table-row">
            <td className="table-cell">{row.id}</td>
            <td className="table-cell">
              <Link href={`/tenants/${row.id}`} className="font-semibold text-primary hover:underline">
                {row.name || "-"}
              </Link>
            </td>
            <td className="table-cell">{row.phone || "-"}</td>
            <td className="table-cell">{row.email || "-"}</td>
            <td className="table-cell">{row.user_id ?? "-"}</td>
            <td className="table-cell">
              {row.property_id != null
                ? propertyNames[row.property_id] ?? row.property_id
                : "-"}
            </td>
            <td className="table-cell">
              {row.status ? <Badge>{row.status}</Badge> : "-"}
            </td>
            <td className="table-cell">{fds(row.created_at)}</td>
          </tr>
        )}
      </DataTable>
    </div>
  );
}