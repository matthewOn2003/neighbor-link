"use client";

import { Link } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useDropdown } from "@/hooks/useDropdown";
import { fdl } from "@/utils/date";

function Pill({ item, fallback }) {
  return <span className={`status-pill ${item?.variant || "neutral"}`}>{item?.label ?? fallback}</span>;
}

export default function ComplaintsPage() {
  const { t } = useLocale();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({
    keyword: "",
    status: "",
    category: "",
  });
  const update = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));

  const { optionsOf } = useDropdown(["complaint_category", "complaint_status"]);
  const categoryItems = optionsOf("complaint_category");
  const statusItems = optionsOf("complaint_status");
  const categoryMap = Object.fromEntries(categoryItems.map((item) => [item.value, item]));
  const statusMap = Object.fromEntries(statusItems.map((item) => [item.value, item]));
  const categoryOptions = [{ value: "", label: t("all_categories") }, ...categoryItems];
  const statusOptions = [{ value: "", label: t("all_statuses") }, ...statusItems];
  const labelFor = (options, value) => options.find((option) => option.value === value)?.label ?? value;

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api="/tenant-portal/complaint/list"
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "keyword", label: t("search_keyword") },
            { key: "status", label: t("status"), display: (value) => labelFor(statusOptions, value) },
            { key: "category", label: t("category"), display: (value) => labelFor(categoryOptions, value) },
          ]}
          onClearFilter={clear}
          title={t("complaints")}
          description={t("complaints_description")}
          summary={({ total }) => (
            <SummaryCard label={t("total_complaints")} value={total} icon="report" />
          )}
          emptyText={t("no_complaints")}
          filters={(
            <>
              <Input
                variant="filter"
                name="keyword"
                label={t("search_keyword")}
                value={draft.keyword}
                placeholder={t("search_complaints")}
                onChange={update("keyword")}
              />
              <Select variant="filter" name="status" label={t("status")} value={draft.status} onChange={update("status")} options={statusOptions} />
              <Select variant="filter" name="category" label={t("category")} value={draft.category} onChange={update("category")} options={categoryOptions} />
            </>
          )}
          resetFilters={reset}
          applyFilters={apply}
          buttons={(
            <Link className="btn btn-primary" href="/complaints/new">
              <Icon name="add" className="text-lg" />
              <span>{t("new_complaint")}</span>
            </Link>
          )}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              <th>{t("title")}</th>
              <th>{t("category")}</th>
              <th>{t("status")}</th>
              <th>{t("created_at")}</th>
              <th>{t("updated_at")}</th>
              <th>{t("action")}</th>
            </tr>
          )}
          body={({ rows }) =>
            rows.map((item) => (
              <tr className="group" key={item.id}>
                <td>
                  <Link
                    className="font-semibold text-scene-content group-hover:text-primary-dark transition-colors"
                    href={`/complaints/${item.id}`}
                  >
                    {item.title}
                  </Link>
                </td>
                <td className="text-scene-content">{categoryMap[item.category]?.label ?? item.category}</td>
                <td>
                  <Pill item={statusMap[item.status]} fallback={item.status} />
                </td>
                <td className="whitespace-nowrap text-subtle">{fdl(item.created_at)}</td>
                <td className="whitespace-nowrap text-subtle">{fdl(item.updated_at)}</td>
                <td>
                  <div className="flex justify-center items-center gap-2">
                    <Link
                      className="btn btn-primary !p-0 size-10 grid place-items-center"
                      href={`/complaints/${item.id}`}
                      aria-label={t("view")}
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
