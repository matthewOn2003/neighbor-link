"use client";

import { use } from "react";
import { Link } from "@/i18n/navigation";
import { Icon, Spinner, DataTable, SummaryCard, Input, Select, StatusBadge } from "@/components/ui";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useApiData } from "@/hooks/useApiData";
import { apiRequest } from "@/utils/apiRequest";
import { useDropdown } from "@/hooks/useDropdown";
import { useLocale } from "@/i18n";
import { fdl } from "@/utils/date";
import { indexBy, labelMap } from "@/utils/collections";


export default function FloorDetailPage({ params }) {
  const { id, blockId, floorId } = use(params);
  const { t, locale } = useLocale();
  const { data: floor, loading, error } = useApiData("/property/floor/detail", { id: Number(floorId) });
  const { labelOf, optionsOf } = useDropdown(["unit_status", "bedroom_count"]);
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({
    status: "",
    keyword: "",
    bedrooms: "",
    size_min: "",
    size_max: "",
    tenant_name: "",
  });

  const statusOptions = [{ value: "", label: t("all_statuses") }, ...optionsOf("unit_status")];
  const statusMap = indexBy(statusOptions);
  const bedroomOptions = [{ value: "", label: t("all_bedrooms") }, ...optionsOf("bedroom_count")];
  const bedroomLabel = labelMap(bedroomOptions);

  if (error) {

    return <main className="p-4 md:p-8 text-error">{error.message}</main>;
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
          <span className="text-scene-content font-semibold">{t("floor_level", { level: floor.level })}</span>
        </nav>

        <DataTable
          api={"/property/unit/list"}
          params={{ ...applied, floor_id: floorId }}
          filterValues={draft}
          filterBadges={[
            { key: "keyword", label: t("unit_code") },
            { key: "status", label: t("status"), display: (value) => statusMap[value]?.label ?? value },
            { key: "bedrooms", label: t("bedrooms"), display: (value) => bedroomLabel[value] ?? value },
            { key: "size_min", label: t("size_min") },
            { key: "size_max", label: t("size_max") },
            { key: "tenant_name", label: t("tenant_name") },
          ]}
          onClearFilter={clear}
          exportConfig={{
            filename: `floor-${floor.level}-units`,
            columns: [
              { label: t("unit_code"), get: (r) => r.code },
              { label: t("block"), get: (r) => r.block_code },
              { label: t("floor_level", { level: floor.level }), get: (r) => r.floor_level },
              { label: t("bedrooms"), get: (r) => r.bedrooms },
              { label: t("size_sqft"), get: (r) => r.size_sqft },
              { label: t("status"), get: (r) => labelOf("unit_status", r.status) },
              { label: t("tenant"), get: (r) => r.tenant_name },
              { label: t("created_at"), get: (r) => fdl(r.created_at) },
              { label: t("updated_at"), get: (r) => fdl(r.updated_at) },
            ],
          }}
          importConfig={{
            title: t("import_units"),
            sampleName: `floor-${floor.level}-units-import-template`,
            columns: [
              { key: "code", label: t("unit_code"), required: true, sample: `${floor.block_code}-${String(floor.level).padStart(2, "0")}-01` },
              { key: "bedrooms", label: t("bedrooms"), required: true, sample: "2" },
              { key: "size_sqft", label: t("size_sqft"), required: true, sample: "750" },
              { key: "status", label: t("status"), sample: "vacant" },
            ],
            onRow: (values) =>
              apiRequest("/property/unit/create", {
                block_id: Number(blockId),
                floor_id: Number(floorId),
                code: values.code,
                bedrooms: Number(values.bedrooms),
                size_sqft: Number(values.size_sqft),
                status: values.status || "vacant",
              }),
          }}
          title={t("floor_level", { level: floor.level })}
          description={`${t("block")} ${floor.block_code}`}
          buttons={(
            <Link href={`/properties/${id}/blocks/${blockId}/floors/${floorId}/units/new`} className="btn btn-primary">
              <Icon name="add" className="text-lg" />
              <span>{t("new_unit")}</span>
            </Link>
          )}
          summary={({ total }) => (
            <SummaryCard label={t("total_units")} value={total} icon="meeting_room" />
          )}
          filters={(
            <>
              <Input
                variant="filter"
                name="keyword"
                label={t("unit_code")}
                value={draft.keyword}
                onChange={(keyword) => setDraft((current) => ({ ...current, keyword }))}
              />

              <Select
                variant="filter"
                name="status"
                label={t("status")}
                value={draft.status}
                onChange={(status) => setDraft((current) => ({ ...current, status }))}
                options={statusOptions}
              />

              <Select
                variant="filter"
                name="bedrooms"
                label={t("bedrooms")}
                value={draft.bedrooms}
                onChange={(bedrooms) => setDraft((current) => ({ ...current, bedrooms }))}
                options={bedroomOptions}
              />

              <Input
                variant="filter"
                name="size_min"
                type="number"
                label={t("size_min")}
                value={draft.size_min}
                onChange={(size_min) => setDraft((current) => ({ ...current, size_min }))}
              />

              <Input
                variant="filter"
                name="size_max"
                type="number"
                label={t("size_max")}
                value={draft.size_max}
                onChange={(size_max) => setDraft((current) => ({ ...current, size_max }))}
              />

              <Input
                variant="filter"
                name="tenant_name"
                label={t("tenant_name")}
                value={draft.tenant_name}
                onChange={(tenant_name) => setDraft((current) => ({ ...current, tenant_name }))}
              />
            </>
          )}
          resetFilters={reset}
          applyFilters={apply}
          emptyText={t("no_units")}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              <th>{t("unit_code")}</th>
              <th>{t("bedrooms")}</th>
              <th>{t("size_sqft")}</th>
              <th>{t("status")}</th>
              <th>{t("tenant")}</th>
              <th className="text-center">{t("action")}</th>
            </tr>
          )}
          body={({ rows }) =>
            rows.map((unit) => (
              <tr className="group" key={unit.id}>
                <td className="font-semibold text-scene-content">{unit.code}</td>
                <td>{unit.bedrooms}</td>
                <td>{Number(unit.size_sqft).toLocaleString(locale)}</td>
                <td>
                  <StatusBadge value={unit.status} options={statusOptions} />
                </td>
                <td className="text-scene-content">{unit.tenant_name ?? "-"}</td>
                <td>
                  <div className="flex justify-center items-center gap-2">
                    <Link
                      className="btn btn-primary btn-icon"
                      href={`/properties/${id}/blocks/${blockId}/floors/${floorId}/units/${unit.id}`}
                      aria-label={t("edit_unit")}
                    >
                      <Icon name="edit" className="text-lg" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))
          }
        />
      </div>
    </main>
  );
}
