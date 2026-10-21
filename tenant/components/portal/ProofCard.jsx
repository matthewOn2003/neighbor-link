"use client";

import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { money } from "@/components/payments/shared";
import { formatDate } from "./format";
import { PROOF_ICON, PROOF_LABEL_KEY, PROOF_TONE } from "./status";
import { GhostButton, GlassCard, IconTile, Pill } from "./primitives";

export default function ProofCard({ proof, billPeriod, onReupload }) {
  const { t, locale } = useLocale();
  const tone = PROOF_TONE[proof.status] ?? "neutral";

  return (
    <GlassCard className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={PROOF_ICON[proof.status] ?? "receipt"} tone={tone} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="truncate text-sm font-bold text-on-surface">{proof.reference || t("portal_no_reference")}</span>
              <Pill tone={tone}>{t(PROOF_LABEL_KEY[proof.status] ?? "portal_proof_pending")}</Pill>
            </div>
            <p className="mt-0.5 text-xs text-on-surface-variant">
              {t("paid_at")}: {formatDate(proof.paid_at, locale)}
              {billPeriod ? ` · ${billPeriod}` : ""}
            </p>
          </div>
        </div>
        <p className="shrink-0 text-sm font-extrabold text-on-surface">{money(proof.amount, locale)}</p>
      </div>

      {proof.status === "rejected" && proof.reject_reason ? (
        <div className="mt-3 flex gap-3 rounded-xl border border-rose-500/25 bg-rose-950/40 p-3">
          <Icon name="info" className="text-[18px] text-rose-300" />
          <div className="min-w-0">
            <p className="text-xs font-bold text-rose-200">{t("portal_rejection_reason")}</p>
            <p className="mt-0.5 text-xs text-on-surface-variant">{proof.reject_reason}</p>
          </div>
        </div>
      ) : null}

      <div className="mt-3 flex items-center justify-between gap-2 border-t border-white/[0.08] pt-3">
        <span className="text-xs text-on-surface-variant">{proof.file_url ? t("portal_proof_image_provided") : t("no_proof_file")}</span>
        {proof.status === "rejected" ? (
          <GhostButton onClick={() => onReupload(proof.bill_id)}>
            <Icon name="refresh" className="text-[16px]" />
            {t("portal_reupload_receipt")}
          </GhostButton>
        ) : proof.file_url ? (
          <a
            href={proof.file_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
          >
            <Icon name="visibility" className="text-[16px]" />
            {t("view_receipt")}
          </a>
        ) : null}
      </div>
    </GlassCard>
  );
}
