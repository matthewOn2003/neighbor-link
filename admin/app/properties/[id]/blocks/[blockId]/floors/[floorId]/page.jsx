"use client";

import { use } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Checkbox } from "@/components/ui/Checkbox";
import { UnitStatusBadge } from "@/components/property/parts";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useRequest } from "@/hooks/useRequest";
import { useDropdown } from "@/hooks/useDropdown";
import { useSelection } from "@/hooks/useSelection";
import { useLocale } from "@/i18n";

const BEDROOM_OPTIONS = [1, 2, 3, 4, 5];

export default function FloorDetailPage({ params }) {
  const { id, blockId, floorId } = use(params);
  const { t, locale } = useLocale();
  const sel = useSelection();
  const { data: floor, loading, error } = useRequest(`/property/floor/${floorId}`);
  const { labelOf, optionsOf } = useDropdown(["unit_status"]);
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({
    status: "",
    keyword: "",
    bedrooms: "",
    size_min: "",
    size_max: "",
    tenant_name: "",
  });

  const statusOptions = [{ value: "", label: t("all_statuses") }, ...optionsOf("unit_status")];
  const statusMap = Object.fromEntries(statusOptions.map((option) => [option.value, option]));
  const bedroomOptions = [
    { value: "", label: t("all_bedrooms") },
    ...BEDROOM_OPTIONS.map((count) => ({ value: String(count), label: String(count) })),
  ];
  const bedroomLabel = Object.fromEntries(bedroomOptions.map((option) => [option.value, option.label]));

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
          <span className="text-scene-content font-semibold">{t("floor_level", { level: floor.level })}</span>
        </nav>

        <DataTable
          api="/property/unit/list"
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
          title={t("floor_level", { level: floor.level })}
          description={`${t("block")} ${floor.block_code}`}
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
          header={({ rows }) => (
            <tr className="bg-accent text-subtle font-semibold">
              <th className="sticky-left">
                <Checkbox
                  checked={sel.isAllSelected(rows)}
                  onChange={() => sel.toggleAll(rows)}
                />
              </th>
              <th>{t("unit_code")}</th>
              <th>{t("bedrooms")}</th>
              <th>{t("size_sqft")}</th>
              <th>{t("status")}</th>
              <th>{t("tenant")}</th>
            </tr>
          )}
          body={({ rows }) =>
            rows.map((unit) => (
              <tr className="group" key={unit.id}>
                <td className="sticky-left">
                  <Checkbox
                    checked={sel.isSelected(unit.id)}
                    onChange={() => sel.toggle(unit.id)}
                  />
                </td>
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
