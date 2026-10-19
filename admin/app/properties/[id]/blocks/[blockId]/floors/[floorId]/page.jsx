"use client";

import { use } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { DataTable } from "@/components/ui/DataTable";
import { UnitStatusBadge } from "@/components/property/parts";
import { useRequest } from "@/hooks/useRequest";
import { useDropdown } from "@/hooks/useDropdown";
import { useLocale } from "@/i18n";

export default function FloorDetailPage({ params }) {
  const { id, blockId, floorId } = use(params);
  const { t, locale } = useLocale();
  const { data: floor, loading, error } = useRequest(`/property/floor/${floorId}`);
  const { labelOf } = useDropdown(["unit_status"]);

  if (error) {
    return <main className="p-4 md:p-8 text-error">{error}</main>;
  }
  if (loading || !floor) {
    return <main className="flex justify-center p-8 text-subtle"><Spinner size="lg" label={t("loading")} /></main>;
  }

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <nav className="flex flex-wrap items-center gap-1 text-sm text-subtle">
          <Link className="hover:text-primary-dark" href="/properties">{t("properties")}</Link>
          <Icon name="chevron_right" className="text-base" />
          <Link className="hover:text-primary-dark" href={`/properties/${id}`}>{floor.property_name}</Link>
          <Icon name="chevron_right" className="text-base" />
          <Link className="hover:text-primary-dark" href={`/properties/${id}/blocks/${blockId}`}>
            {floor.block_name || floor.block_code}
          </Link>
          <Icon name="chevron_right" className="text-base" />
          <span className="text-scene-content font-medium">{t("floor_level", { level: floor.level })}</span>
        </nav>

        <DataTable
          api="/property/unit/list"
          params={{ floor_id: floorId }}
          title={t("floor_level", { level: floor.level })}
          description={`${t("block")} ${floor.block_code}`}
          emptyText={t("no_units")}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              <th>{t("unit_code")}</th>
              <th>{t("bedrooms")}</th>
              <th>{t("size_sqft")}</th>
              <th>{t("status")}</th>
              <th>{t("tenant")}</th>
            </tr>
          )}
          body={({ rows }) =>
            rows.map((unit) => (
              <tr key={unit.id}>
                <td className="font-semibold text-scene-content">{unit.code}</td>
                <td>{unit.bedrooms}</td>
                <td>{Number(unit.size_sqft).toLocaleString(locale)}</td>
                <td>
                  <UnitStatusBadge status={unit.status} label={labelOf("unit_status", unit.status)} />
                </td>
                <td className="text-scene-content">{unit.tenant_name ?? "-"}</td>
              </tr>
            ))
          }
        />
      </div>
    </main>
  );
}

