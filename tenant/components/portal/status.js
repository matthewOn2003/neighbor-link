"use client";

import { useLocale } from "@/i18n";
import { useDropdown } from "@/hooks/useDropdown";

// Bill display statuses come from the API (rules.DisplayStatus).
export const BILL_TONE = { paid: "emerald", overdue: "rose", pending_review: "amber", unpaid: "cyan", void: "neutral" };
export const BILL_LABEL_KEY = {
  paid: "bill_display_paid",
  overdue: "bill_display_overdue",
  pending_review: "bill_display_pending_review",
  unpaid: "bill_display_unpaid",
  void: "bill_display_void",
};

export const PROOF_TONE = { pending: "amber", approved: "emerald", rejected: "rose" };
export const PROOF_ICON = { pending: "hourglass_top", approved: "check_circle", rejected: "cancel" };
export const PROOF_LABEL_KEY = {
  pending: "portal_proof_pending",
  approved: "portal_proof_approved",
  rejected: "portal_proof_rejected",
};

// Repairs and complaints share the same four statuses.
export const STATUS_TONE = { open: "amber", in_progress: "cyan", resolved: "emerald", closed: "neutral" };
export const STATUS_LABEL_KEY = {
  open: "portal_status_open",
  in_progress: "portal_status_in_progress",
  resolved: "portal_status_resolved",
  closed: "portal_status_closed",
};
export const STATUS_FILTERS = ["open", "in_progress", "resolved", "closed"];

// Progress shown on a repair: four steps from logged to closed.
export const REQUEST_STAGE = { open: 1, in_progress: 2, resolved: 3, closed: 4 };
export const REQUEST_STAGE_TOTAL = 4;

export const PRIORITY_TONE = { low: "neutral", normal: "cyan", high: "amber", urgent: "rose" };

export const MAINTENANCE_ICON = {
  plumbing: "water_drop",
  electrical: "bolt",
  aircond: "ac_unit",
  appliance: "kitchen",
  structure: "door_sliding",
  other: "build",
};
export const COMPLAINT_ICON = {
  noise: "volume_up",
  hygiene: "delete_sweep",
  neighbour_dispute: "groups",
  safety: "shield",
  other: "report",
};

/**
 * Returns a translator that falls back to `fallback` when the key has no translation.
 * Used for backend error codes and dictionary values the UI may not know yet.
 */
export function useTOr() {
  const { t, localeProperties } = useLocale();
  const messages = localeProperties.messages ?? {};
  return (key, fallback) => (messages[key] ? t(key) : fallback);
}

/**
 * Label for a dictionary option. Known values translate through `opt_<slug>_<value>`;
 * anything else keeps the label the API returned.
 */
export function useOptionLabel() {
  const { t, localeProperties } = useLocale();
  const messages = localeProperties.messages ?? {};
  return (slug, option) => {
    if (!option) return "";
    const key = `opt_${slug}_${option.value}`;
    return messages[key] ? t(key) : option.label;
  };
}

/**
 * Translated label for a dictionary value. Options come from the backend dictionary
 * (/dictionary/dropdown); known values use `opt_<slug>_<value>` translations.
 */
export function useDictLabel(slugs) {
  const { dropdown } = useDropdown(slugs);
  const optionLabel = useOptionLabel();
  return (slug, value) => {
    const found = (dropdown[slug] ?? []).find((option) => (option.value ?? option.id) === value);
    if (!found) return value ?? "";
    return optionLabel(slug, { value, label: found.label ?? found[`${slug}_display`] ?? value });
  };
}
