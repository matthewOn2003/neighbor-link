"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { useApiData } from "@/hooks/useApiData";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDropdown } from "@/hooks/useDropdown";
import { useOptionLabel, STATUS_FILTERS, STATUS_LABEL_KEY } from "@/components/portal/status";
import { RepairCard, ComplaintCard } from "@/components/portal/RequestCards";
import NewRequestSheet from "@/components/portal/NewRequestSheet";
import { EmptyState, FilterChips, LoadingBlock, SegmentedTabs, Stagger, inputClass } from "@/components/portal/primitives";
import { Input } from "@/components/ui";

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServicesContent />
    </Suspense>
  );
}

// Home quick actions open this page with ?new=maintenance or ?new=complaint.
function requestedKind(searchParams) {
  const value = searchParams.get("new");
  return value === "maintenance" || value === "complaint" ? value : null;
}

function ServicesContent() {
  const { t } = useLocale();
  const optionLabel = useOptionLabel();
  const searchParams = useSearchParams();
  const initialKind = requestedKind(searchParams);
  const [kind, setKind] = useState(initialKind ?? "maintenance");
  const [status, setStatus] = useState("all");
  const [keyword, setKeyword] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sheet, setSheet] = useState(() => (initialKind ? { kind: initialKind } : null)); // null when closed; { kind } when open
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 300);

  const params = {
    current_page: 1,
    per_page: 50,
    keyword: debouncedKeyword,
    status: status === "all" ? "" : status,
  };
  const repairs = useApiData("/tenant-portal/maintenance/list", params);
  const complaints = useApiData("/tenant-portal/complaint/list", params);
  const dict = useDropdown(["maintenance_category", "complaint_category"]);

  const current = kind === "maintenance" ? repairs : complaints;
  const list = current.data?.list ?? [];
  // Filters stay hidden until asked for; the count shows when a filter is active while they are closed.
  const activeFilters = (status !== "all" ? 1 : 0) + (keyword.trim() ? 1 : 0);

  const statusItems = [
    { key: "all", label: t("all_statuses") },
    ...STATUS_FILTERS.map((key) => ({ key, label: t(STATUS_LABEL_KEY[key]) })),
  ];

  function refresh() {
    repairs.reload();
    complaints.reload();
  }

  return (
    <div className="flex flex-col gap-5">
      <SegmentedTabs
        value={kind}
        onChange={setKind}
        items={[
          { key: "maintenance", label: t("portal_repairs"), icon: "build" },
          { key: "complaint", label: t("complaints"), icon: "campaign" },
        ]}
      />

      <div className="flex flex-col gap-3">
        <button
          type="button"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen((open) => !open)}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs font-bold text-on-surface transition-colors hover:bg-white/[0.08]"
        >
          <Icon name="tune" className="text-[16px]" />
          {t("portal_filters")}
          {activeFilters > 0 ? (
            <span className="rounded-full bg-primary/20 px-1.5 text-[10px] text-primary">{activeFilters}</span>
          ) : null}
        </button>
        {filtersOpen ? (
          <div className="flex flex-col gap-2.5">
            <div className="relative">
              <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" />
              <Input
                name="keyword"
                label={t("portal_search_requests")}
                hideLabel
                icon="search"
                placeholder={t("portal_search_requests")}
                value={keyword}
                onChange={setKeyword}
              />
            </div>
            <FilterChips items={statusItems} value={status} onChange={setStatus} />
          </div>
        ) : null}
      </div>

      <section className="flex flex-col gap-3">
        {current.loading && !current.data ? <LoadingBlock /> : null}
        {!current.loading && list.length === 0 ? (
          <EmptyState
            icon="manage_search"
            title={t(kind === "maintenance" ? "no_maintenance_requests" : "no_complaints")}
            description={t("portal_no_matching_hint")}
          />
        ) : null}
        {list.map((item, index) => (
          <Stagger key={item.id} index={index}>
            {kind === "maintenance" ? (
              <RepairCard
                item={item}
                categoryLabel={optionLabel("maintenance_category", dictOption(dict, "maintenance_category", item.category))}
              />
            ) : (
              <ComplaintCard
                item={item}
                categoryLabel={optionLabel("complaint_category", dictOption(dict, "complaint_category", item.category))}
              />
            )}
          </Stagger>
        ))}
      </section>

      <button
        type="button"
        onClick={() => setSheet({ kind })}
        className="fixed bottom-24 right-4 z-30 flex items-center gap-2 rounded-2xl bg-primary-container px-5 py-3.5 text-sm font-bold text-white shadow-2xl shadow-primary-container/40 transition-all active:scale-95"
      >
        <Icon name="add" className="text-[20px]" />
        {t("portal_new_request")}
      </button>

      {sheet ? (
        <NewRequestSheet
          initialKind={sheet.kind}
          onClose={() => setSheet(null)}
          onCreated={() => {
            setSheet(null);
            refresh();
          }}
        />
      ) : null}
    </div>
  );
}

function dictOption(dict, slug, value) {
  return dict.optionsOf(slug).find((o) => o.value === value) ?? { value, label: value ?? "" };
}
