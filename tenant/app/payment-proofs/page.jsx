"use client";

import { useLocale } from "@/i18n";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { DataTable, SummaryCard } from "@/components/ui/DataTable";
import { Select } from "@/components/ui/Select";
import { useDraftFilters } from "@/hooks/useDraftFilters";
import { useDropdown } from "@/hooks/useDropdown";
import { fdl } from "@/utils/date";
import { money } from "@/components/payments/shared";

export default function PaymentProofsPage() {
  const { t, locale } = useLocale();
  const { draft, setDraft, applied, apply, reset, clear } = useDraftFilters({ status: "" });
  const { optionsOf } = useDropdown(["payment_proof_status"]);
  const statusItems = optionsOf("payment_proof_status");
  const statusMap = Object.fromEntries(statusItems.map((item) => [item.value, item]));
  const statusOptions = [{ value: "", label: t("all_statuses") }, ...statusItems];
  const labelFor = (value) => statusOptions.find((option) => option.value === value)?.label ?? value;
  const update = (key) => (value) => setDraft((current) => ({ ...current, [key]: value }));

  return (
    <main className="flex flex-col w-full">
      <div className="p-4 md:p-8 space-y-6">
        <DataTable
          api="/tenant-portal/payment-proof/list"
          params={applied}
          filterValues={draft}
          filterBadges={[
            { key: "status", label: t("status"), display: labelFor },
          ]}
          onClearFilter={clear}
          title={t("menu_payment_proofs")}
          description={t("payment_proofs_description")}
          buttons={(
            <Link className="btn btn-primary" href="/payment-proofs/new">
              <Icon name="add" className="text-lg" />
              <span>{t("submit_payment_proof")}</span>
            </Link>
          )}
          summary={({ total }) => (
            <SummaryCard label={t("total_payment_proofs")} value={total} icon="receipt" />
          )}
          emptyText={t("no_payment_proofs")}
          filters={(
            <Select variant="filter" name="status" label={t("status")} value={draft.status} onChange={update("status")} options={statusOptions} />
          )}
          resetFilters={reset}
          applyFilters={apply}
          header={() => (
            <tr className="bg-accent text-subtle font-semibold">
              <th>{t("billing_period")}</th>
              <th>{t("payment_amount")}</th>
              <th>{t("paid_at")}</th>
              <th>{t("payment_reference")}</th>
              <th>{t("status")}</th>
              <th>{t("reject_reason")}</th>
              <th>{t("proof_image")}</th>
            </tr>
          )}
          body={({ rows }) =>
            rows.map((proof) => {
              const status = statusMap[proof.status];
              return (
                <tr key={proof.id} className="group">
                  <td className="font-semibold text-scene-content">{proof.bill_period}</td>
                  <td className="text-scene-content">{money(proof.amount, locale)}</td>
                  <td className="whitespace-nowrap text-subtle">{fdl(proof.paid_at)}</td>
                  <td className="text-scene-content">{proof.reference || "-"}</td>
                  <td>
                    <span className={`status-pill ${status?.variant || "neutral"}`}>{status?.label ?? proof.status}</span>
                  </td>
                  <td className="text-subtle">{proof.reject_reason || "-"}</td>
                  <td>
                    {proof.file_url ? (
                      <a className="text-primary-dark underline" href={proof.file_url} target="_blank" rel="noreferrer">
                        {t("view_image")}
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              );
            })
          }
        />
      </div>
    </main>
  );
}
