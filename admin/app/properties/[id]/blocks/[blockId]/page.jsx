"use client";

import { use } from "react";
import { Link } from "@/i18n/navigation";
import { Icon, Spinner } from "@/components/ui";
import { OccupancyBar, StatBlock } from "@/components/property/parts";
import { useApiRequest } from "@/hooks/useApiRequest";
import { useLocale } from "@/i18n";
import { api } from "@/services/api";

export default function BlockDetailPage({ params }) {
  const { id, blockId } = use(params);
  const { t } = useLocale();
  const { data: block, loading, error } = useApiRequest(api.property.blockDetail, { id: Number(blockId) });
  const { data: floorData } = useApiRequest(api.property.floorList, {
    block_id: blockId,
    per_page: 100,
  });
  const floors = floorData?.list ?? [];

  if (error) {
    return <main className="p-4 md:p-8 text-error">{error}</main>;
  }

  if (loading || !block) {
    return (
      <main className="flex justify-center p-8 text-subtle">
        <Spinner size="lg" label={t("loading")} />
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col">
      <div className="space-y-6 p-4 md:p-8">
        <nav className="flex items-center gap-1 text-sm text-subtle">
          <Link className="hover:text-primary-dark" href="/properties">
            {t("properties")}
          </Link>
          <Icon name="chevron_right" className="text-base" />
          <Link className="hover:text-primary-dark" href={`/properties/${id}`}>
            {block.property_name}
          </Link>
          <Icon name="chevron_right" className="text-base" />
          <span className="font-semibold text-scene-content">{block.name || block.code}</span>
        </nav>

        <div className="space-y-4 rounded-xl bg-accent p-6 shadow">
          <div className="space-y-1">
            <p className="text-xs text-subtle">
              {t("block")} {block.code}
            </p>
            <h1 className="text-3xl font-semibold text-scene-content">
              {block.name || block.code}
            </h1>
          </div>
          <div className="grid max-w-3xl grid-cols-2 gap-3 md:grid-cols-4">
            <StatBlock value={block.floor_count} label={t("floors")} />
            <StatBlock value={block.units_per_floor} label={t("units_per_floor")} />
            <StatBlock value={block.unit_count} label={t("units")} />
            <StatBlock value={block.occupied_count} label={t("occupied")} />
          </div>
          <div className="max-w-3xl">
            <OccupancyBar
              label={t("occupancy_rate")}
              occupied={block.occupied_count}
              total={block.unit_count}
            />
          </div>
        </div>

        <section className="space-y-4 rounded-xl bg-accent p-6 shadow">
          <h2 className="text-lg font-semibold text-scene-content">{t("floors")}</h2>
          {floors.length === 0 ? (
            <p className="text-sm text-subtle">{t("no_floors")}</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {floors.map((floor) => (
                <Link
                  key={floor.id}
                  href={`/properties/${id}/blocks/${blockId}/floors/${floor.id}`}
                  className="group flex flex-col gap-3 rounded-xl bg-scene p-4 transition-shadow hover:shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-scene-content transition-colors group-hover:text-primary-dark">
                      {t("floor_level", { level: floor.level })}
                    </h3>
                    <Icon
                      name="chevron_right"
                      className="text-subtle group-hover:text-primary-dark"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <StatBlock value={floor.unit_count} label={t("units")} />
                    <StatBlock value={floor.occupied_count} label={t("occupied")} />
                  </div>
                  <OccupancyBar
                    label={t("occupancy_rate")}
                    occupied={floor.occupied_count}
                    total={floor.unit_count}
                  />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}