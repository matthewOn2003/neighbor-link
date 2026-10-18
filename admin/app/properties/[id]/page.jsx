"use client";

import { use } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { OccupancyBar, PropertyCover, StatBlock } from "@/components/property/parts";
import { useRequest } from "@/hooks/useRequest";
import { useDropdown } from "@/hooks/useDropdown";
import { useLocale } from "@/i18n";

export default function PropertyDetailPage({ params }) {
  const { id } = use(params);
  const { t } = useLocale();
  const { data: property, loading, error } = useRequest(`/property/detail/${id}`);
  const { data: blockData } = useRequest("/property/block/list", { property_id: id, per_page: 100 });
  const blocks = blockData?.list ?? [];
  const { labelOf } = useDropdown(["property_type"]);

  if (error) {
    return <main className="p-8 text-error">{error}</main>;
  }
  if (loading || !property) {
    return <main className="p-8 text-subtle">{t("loading")}</main>;
  }

  const typeLabel = labelOf("property_type", property.property_type);
  const location = [property.address, property.city].filter(Boolean).join(", ");

  return (
    <main className="flex flex-col w-full">
      <div className="p-8 space-y-6">
        <Link className="inline-flex items-center gap-1 text-sm text-subtle hover:text-primary-dark" href="/properties">
          <Icon name="arrow_back" className="text-lg" />
          <span>{t("back_to_properties")}</span>
        </Link>

        <div className="rounded-xl bg-accent shadow overflow-hidden">
          <PropertyCover id={property.id} coverImage={property.cover_image} className="h-56" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold text-scene-content">{property.name}</h1>
                <span className="px-2.5 py-1 rounded-full bg-scene text-primary text-xs font-semibold">{typeLabel}</span>
              </div>
              <p className="text-sm text-subtle">
                {t("developer")}: <span className="font-medium text-scene-content">{property.developer_name ?? "-"}</span>
              </p>
              <p className="text-sm text-subtle">
                {t("address")}: <span className="text-scene-content">{location || "-"}</span>
              </p>
              {property.description ? (
                <p className="text-sm text-scene-content leading-relaxed">{property.description}</p>
              ) : null}
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <StatBlock value={property.block_count} label={t("blocks")} />
                <StatBlock value={property.unit_count} label={t("units")} />
                <StatBlock value={property.occupied_count} label={t("occupied")} />
              </div>
              <OccupancyBar label={t("occupancy_rate")} occupied={property.occupied_count} total={property.unit_count} />
            </div>
          </div>
        </div>

        <section className="p-6 rounded-xl bg-accent shadow space-y-4">
          <h2 className="text-lg font-semibold text-scene-content">{t("blocks")}</h2>
          {blocks.length === 0 ? (
            <p className="text-sm text-subtle">{t("no_blocks")}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {blocks.map((block) => (
                <Link
                  key={block.id}
                  href={`/properties/${property.id}/blocks/${block.id}`}
                  className="group flex flex-col gap-3 p-4 rounded-xl bg-scene hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs text-subtle">{t("block")} {block.code}</p>
                      <h3 className="font-semibold text-scene-content truncate group-hover:text-primary-dark transition-colors">
                        {block.name || block.code}
                      </h3>
                    </div>
                    <Icon name="chevron_right" className="text-subtle group-hover:text-primary-dark" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <StatBlock value={block.floor_count} label={t("floors")} />
                    <StatBlock value={block.unit_count} label={t("units")} />
                    <StatBlock value={block.occupied_count} label={t("occupied")} />
                  </div>
                  <OccupancyBar label={t("occupancy_rate")} occupied={block.occupied_count} total={block.unit_count} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
