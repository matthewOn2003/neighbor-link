"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { SearchBar } from "@/components/ui/SearchBar";
import { OccupancyBar, PropertyCover, StatBlock } from "@/components/property/parts";
import { useDragScroll } from "@/hooks/useDragScroll";
import { useRequest } from "@/hooks/useRequest";
import { useDropdown } from "@/hooks/useDropdown";
import { useLocale } from "@/i18n";

const EMPTY_FILTERS = { keyword: "", property_type: "", region: "", developer_id: "" };

function PropertyCard({ property, typeLabel, t }) {
  const location = [property.address, property.city].filter(Boolean).join(", ");
  return (
    <Link
      className="group flex flex-col h-full rounded-xl bg-accent shadow overflow-hidden hover:shadow-lg transition-shadow"
      href={`/properties/${property.id}`}
    >
      <PropertyCover id={property.id} coverImage={property.cover_image} className="h-36" />
      <div className="flex flex-col flex-1 gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-scene-content truncate group-hover:text-primary-dark transition-colors">
              {property.name}
            </h3>
            <p className="text-xs text-subtle truncate">{location}</p>
          </div>
          <span className="shrink-0 px-2.5 py-1 rounded-full bg-scene text-primary text-xs font-semibold">{typeLabel}</span>
        </div>

        <p className="text-xs text-subtle truncate">
          {t("developer")}: <span className="font-medium text-scene-content">{property.developer_name ?? "-"}</span>
        </p>

        <div className="grid grid-cols-3 gap-2">
          <StatBlock value={property.block_count} label={t("blocks")} />
          <StatBlock value={property.unit_count} label={t("units")} />
          <StatBlock value={property.occupied_count} label={t("occupied")} />
        </div>

        <div className="mt-auto">
          <OccupancyBar label={t("occupancy_rate")} occupied={property.occupied_count} total={property.unit_count} />
        </div>
      </div>
    </Link>
  );
}

export default function PropertiesPage() {
  const { t } = useLocale();
  const drag = useDragScroll();
  const [keywordInput, setKeywordInput] = useState("");
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // 输入停止 300ms 后才更新查询条件，避免每个字符都发请求
  useEffect(() => {
    const timer = setTimeout(() => setFilters((f) => ({ ...f, keyword: keywordInput.trim() })), 300);
    return () => clearTimeout(timer);
  }, [keywordInput]);

  const hasActiveFilters = keywordInput.trim() !== "" || filters.region !== "" || filters.developer_id !== "";
  const resetFilters = () => {
    setKeywordInput("");
    setFilters((f) => ({ ...EMPTY_FILTERS, property_type: f.property_type }));
  };

  const { labelOf, optionsOf } = useDropdown(["property_type", "property_region"]);
  const { data: facets } = useRequest("/property/facets");
  const { data: listData, loading, error } = useRequest("/property/list", { ...filters, per_page: 100 });

  const typeCounts = Object.fromEntries((facets?.types ?? []).map((f) => [f.value, f.count]));
  const totalCount = (facets?.types ?? []).reduce((sum, f) => sum + f.count, 0);
  const tabs = [
    { value: "", label: t("all"), count: totalCount },
    ...optionsOf("property_type").map((o) => ({ value: o.value, label: o.label, count: typeCounts[o.value] ?? 0 })),
  ];

  const items = listData?.list ?? [];
  const message = loading && items.length === 0 ? t("loading") : error ? error : items.length === 0 ? t("no_properties_match_current_filters") : null;

  return (
    <main className="flex flex-col w-full">
      <div className="p-8 space-y-6">
        <div className="panel">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-scene-content">{t("properties")}</h1>
              <p className="text-sm font-normal text-subtle">{t("manage_properties_description")}</p>
            </div>
            <Link className="btn btn-primary" href="/properties/new">
              <Icon name="add" className="text-lg" />
              <span>{t("add_property")}</span>
            </Link>
          </div>

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">
            <div role="tablist" className="flex items-center gap-1 p-1 rounded-lg bg-scene overflow-x-auto">
              {tabs.map((tab) => {
                const active = filters.property_type === tab.value;
                return (
                  <button
                    key={tab.value || "all"}
                    role="tab"
                    aria-selected={active}
                    type="button"
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold whitespace-nowrap transition-colors ${active ? "bg-accent text-primary shadow" : "text-subtle hover:text-scene-content"
                      }`}
                    onClick={() => setFilters((f) => ({ ...f, property_type: tab.value }))}
                  >
                    {tab.label}
                    <span className="text-xs text-subtle">{tab.count}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <SearchBar
                value={keywordInput}
                onChange={setKeywordInput}
                placeholder={t("search_properties")}
              />

              <select
                className="dropdown w-auto min-w-[160px]"
                aria-label={t("region")}
                value={filters.region}
                onChange={(event) => setFilters((f) => ({ ...f, region: event.target.value }))}
              >
                <option value="">{t("all_regions")}</option>
                {optionsOf("property_region").map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>

              <select
                className="dropdown w-auto min-w-[180px]"
                aria-label={t("developer")}
                value={filters.developer_id}
                onChange={(event) => setFilters((f) => ({ ...f, developer_id: event.target.value }))}
              >
                <option value="">{t("all_developers")}</option>
                {(facets?.developers ?? []).map((d) => (
                  <option key={d.id} value={String(d.id)}>{d.name}</option>
                ))}
              </select>

              {hasActiveFilters ? (
                <button className="btn btn-outline" type="button" onClick={resetFilters}>
                  <Icon name="restart_alt" className="text-lg" />
                  <span>{t("reset_filters")}</span>
                </button>
              ) : null}
            </div>
          </div>

          <div>
            {message ? (
              <div className="px-6 py-10 text-center text-sm text-subtle">{message}</div>
            ) : (
              <div
                {...drag}
                className="overflow-x-auto pb-2"
              >
                <div className="grid grid-rows-2 grid-flow-col auto-cols-[300px] gap-6 w-max">
                  {items.map((property) => (
                    <PropertyCard
                      key={property.id}
                      property={property}
                      typeLabel={labelOf("property_type", property.property_type)}
                      t={t}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
