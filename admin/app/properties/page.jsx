"use client";

import Link from "next/link";
import { PageHeader, DataTable, Badge } from "@/app/components/ui";
import { fds, fdl } from "@/lib/date";

export default function PropertiesPage() {
  return (
    <div className="page-container page-container-lg">
      <PageHeader
        title="Properties"
        description="Manage properties and their occupancy status."
        actions={
          <Link href="/properties/new" className="btn btn-primary">
            New property
          </Link>
        }
      />

      <DataTable
        api="/property/list"
        columns={6}
        emptyTitle="No properties yet"
        emptyDescription="Create your first property to get started."
        head={
          <>
            <th className="table-head-cell">ID</th>
            <th className="table-head-cell">Name</th>
            <th className="table-head-cell">Address</th>
            <th className="table-head-cell">Status</th>
            <th className="table-head-cell">Notes</th>
            <th className="table-head-cell">Created</th>
          </>
        }
      >
        {(row) => (
          <tr className="table-row">
            <td className="table-cell">{row.id}</td>
            <td className="table-cell">
              <Link href={`/properties/${row.id}`} className="font-semibold text-primary hover:underline">
                {row.name || "-"}
              </Link>
            </td>
            <td className="table-cell">{row.address || "-"}</td>
            <td className="table-cell"><Badge>{row.status}</Badge></td>
            <td className="table-cell">{row.notes || "-"}</td>
            <td className="table-cell">{fds(row.created_at)}</td>
          </tr>
        )}
      </DataTable>
    </div>
  );
}