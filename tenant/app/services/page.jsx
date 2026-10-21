"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { useRequest } from "@/hooks/useRequest";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDropdown } from "@/hooks/useDropdown";
import { useOptionLabel, STATUS_FILTERS, STATUS_LABEL_KEY } from "@/components/portal/status";
import { RepairCard, ComplaintCard } from "@/components/portal/RequestCards";
import NewRequestSheet from "@/components/portal/NewRequestSheet";
import { EmptyState, FilterChips, GlassCard, LoadingBlock, SegmentedTabs, inputClass } from "@/components/portal/primitives";

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
  const [sheet, setSheet] = useState(() => (initialKind ? { kind: initialKind } : null)); // null when closed; { kind } when open
  const debouncedKeyword = useDebouncedValue(keyword.trim(), 300);

  const params = {
    current_page: 1,
    per_page: 50,
    keyword: debouncedKeyword,
    status: status === "all" ? "" : status,
  };
  const repairs = useRequest("/tenant-portal/maintenance/list", params);
  const complaints = useRequest("/tenant-portal/complaint/list", params);
  const me = useRequest("/tenant-portal/me", {});
  const dict = useDropdown(["maintenance_category", "complaint_category", "maintenance_priority"]);

  const repairSummary = repairs.data?.summary ?? {};
  const complaintSummary = complaints.data?.summary ?? {};
  const summary = kind === "maintenance" ? repairSummary : complaintSummary;
  const current = kind === "maintenance" ? repairs : complaints;
  const list = current.data?.list ?? [];
  const hotlinePhone = me.data?.property?.ops_desk_phone;

  const statusItems = [
    { key: "all", label: t("all_statuses"), count: summary.total ?? 0 },
    ...STATUS_FILTERS.map((key) => ({ key, label: t(STATUS_LABEL_KEY[key]), count: summary[key] ?? 0 })),
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
          { key: "maintenance", label: t("portal_repairs"), icon: "build", count: repairSummary.total ?? 0 },
          { key: "complaint", label: t("complaints"), icon: "campaign", count: complaintSummary.total ?? 0 },
        ]}
      />

      <div className="grid grid-cols-3 gap-2.5">
        {kind === "maintenance" ? (
          <>
            <SummaryTile value={repairSummary.open ?? 0} label={t("portal_action_needed")} tone="text-amber-200" />
            <SummaryTile value={repairSummary.scheduled ?? 0} label={t("portal_scheduled_visits")} tone="text-cyan-300" />
            <SummaryTile value={repairSummary.total ?? 0} label={t("portal_total_logged")} />
          </>
        ) : (
          <>
            <SummaryTile value={complaintSummary.open ?? 0} label={t("portal_action_needed")} tone="text-amber-200" />
            <SummaryTile value={complaintSummary.in_progress ?? 0} label={t(STATUS_LABEL_KEY.in_progress)} tone="text-cyan-300" />
            <SummaryTile value={complaintSummary.total ?? 0} label={t("portal_total_logged")} />
          </>
        )}
      </div>

      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" />
          <input
            className={`${inputClass} pl-11`}
            placeholder={t("portal_search_requests")}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
        <FilterChips items={statusItems} value={status} onChange={setStatus} />
      </div>

      {hotlinePhone ? (
        <GlassCard className="flex items-center gap-4 p-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/25 to-primary/5">
            <Icon name="support_agent" className="text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-on-surface">{t("portal_emergency_title")}</p>
            <a href={`tel:${hotlinePhone}`} className="mt-1 inline-flex items-center gap-1 text-xs font-bold text-primary">
              {t("portal_call_duty_desk", { phone: hotlinePhone })}
              <Icon name="arrow_forward" className="text-[14px]" />
            </a>
          </div>
        </GlassCard>
      ) : null}

      <section className="flex flex-col gap-3.5">
        {current.loading && !current.data ? <LoadingBlock /> : null}
        {!current.loading && list.length === 0 ? (
          <EmptyState
            icon="manage_search"
            title={t(kind === "maintenance" ? "no_maintenance_requests" : "no_complaints")}
            description={t("portal_no_matching_hint")}
          />
        ) : null}
        {list.map((item) =>
          kind === "maintenance" ? (
            <RepairCard
              key={item.id}
              item={item}
              categoryLabel={optionLabel("maintenance_category", dictOption(dict, "maintenance_category", item.category))}
              priorityLabel={optionLabel("maintenance_priority", dictOption(dict, "maintenance_priority", item.priority))}
            />
          ) : (
            <ComplaintCard
              key={item.id}
              item={item}
              categoryLabel={optionLabel("complaint_category", dictOption(dict, "complaint_category", item.category))}
            />
          ),
        )}
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

function SummaryTile({ value, label, tone = "text-on-surface" }) {
  return (
    <GlassCard className="p-3">
      <p className={`text-xl font-extrabold ${tone}`}>{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase leading-tight tracking-wider text-on-surface-variant">{label}</p>
    </GlassCard>
  );
}
