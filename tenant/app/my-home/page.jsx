"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { money } from "@/components/payments/shared";
import { useApiData } from "@/hooks/useApiData";
import { useDropdown } from "@/hooks/useDropdown";
import { formatBytes, formatDate, ordinal } from "@/components/portal/format";
import { useOptionLabel } from "@/components/portal/status";
import { Disclosure, EmptyState, GhostButton, GlassCard, IconTile, LoadingBlock, Pill, Sheet } from "@/components/portal/primitives";
import LangSelect from "@/components/LangSelect";

export default function MyHomePage() {
  const { t, locale } = useLocale();
  const toast = useToast();
  const optionLabel = useOptionLabel();
  const me = useApiData("/tenant-portal/me", {});
  const wifi = useApiData("/tenant-portal/wifi", {});
  const announcements = useApiData("/tenant-portal/announcement/list", { current_page: 1, per_page: 3 });
  const dict = useDropdown(["property_type"]);
  const [showQr, setShowQr] = useState(false);

  async function copyPassword() {
    try {
      await navigator.clipboard.writeText(wifi.data?.wifi_password ?? "");
      toast.show(t("portal_wifi_copied"), "success");
    } catch {
      toast.show(t("portal_copy_failed"), "error");
    }
  }

  if (me.loading && !me.data) return <LoadingBlock rows={4} />;
  if (!me.data) return <EmptyState icon="error" title={t("portal_load_failed")} />;

  const property = me.data.property;
  const unit = me.data.unit;
  const contract = me.data.contract;
  const propertyType = property ? optionLabel("property_type", dict.optionsOf("property_type").find((o) => o.value === property.property_type) ?? { value: property.property_type, label: property.property_type }) : "";

  return (
    <div className="flex flex-col gap-5">
      {property ? (
        <section className="relative h-56 w-full overflow-hidden rounded-2xl border border-white/10">
          {property.cover_image ? (
            <Image src={property.cover_image} alt={property.name} fill sizes="(max-width: 512px) 100vw, 512px" className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-surface-container to-secondary/10" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute left-3.5 right-3.5 top-3.5 flex items-center justify-between gap-2">
            {propertyType ? (
              <Pill tone="violet" icon="apartment">
                {propertyType}
              </Pill>
            ) : <span />}
            {property.wifi_speed ? <Pill tone="gold">{property.wifi_speed}</Pill> : null}
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-primary">{t("portal_primary_residence")}</p>
              <h1 className="truncate text-xl font-extrabold text-on-surface">{property.name}</h1>
              <p className="truncate text-xs text-on-surface-variant">
                {[unit && t("portal_unit_location", { block: unit.block_code, floor: unit.floor_level }), property.address]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            {unit ? (
              <div className="shrink-0 rounded-xl border border-white/10 bg-black/40 px-2.5 py-1.5 text-right">
                <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant">{t("portal_unit_id")}</p>
                <p className="text-xs font-bold text-on-surface">{unit.code}</p>
              </div>
            ) : null}
          </div>
        </section>
      ) : (
        <GlassCard className="p-4">
          <EmptyState icon="domain_disabled" title={t("no_property_assigned")} />
        </GlassCard>
      )}

      {property ? (
        <section className="flex flex-col gap-2.5">
          <SectionTitle icon="concierge" title={t("portal_utilities_title")} />
          <GlassCard className="p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl border border-primary/30 bg-gradient-to-tr from-secondary/25 to-primary/25 text-sm font-extrabold text-on-surface">
                {(property.ops_desk_name || "NL").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-on-surface">{property.ops_desk_name || t("portal_ops_desk")}</p>
                <p className="text-[11px] text-on-surface-variant">{property.ops_desk_hours || t("portal_ops_desk_description")}</p>
              </div>
            </div>
            {property.ops_desk_phone ? (
              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <a href={`sms:${property.ops_desk_phone}`} className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] py-2.5 text-xs font-bold text-on-surface hover:bg-white/[0.08]">
                  <Icon name="chat" className="text-[16px]" />
                  {t("portal_message_ops")}
                </a>
                <a href={`tel:${property.ops_desk_phone}`} className="flex items-center justify-center gap-2 rounded-xl bg-primary-container py-2.5 text-xs font-bold text-white">
                  <Icon name="call" className="text-[16px]" />
                  {t("portal_emergency_call")}
                </a>
              </div>
            ) : null}
          </GlassCard>
        </section>
      ) : null}

      <Disclosure icon="campaign" title={t("portal_announcements_title")} trailing={announcements.data?.list?.length ? String(announcements.data.list.length) : undefined}>
        {announcements.data?.list?.length ? (
          announcements.data.list.map((item) => (
            <GlassCard key={item.id} className="flex flex-col gap-1 p-4">
              <p className="text-sm font-bold text-on-surface">{item.title}</p>
              {item.body ? <p className="line-clamp-2 text-xs text-on-surface-variant">{item.body}</p> : null}
              <p className="mt-0.5 text-[10px] text-on-surface-variant/70">{formatDate(item.published_at, locale)}</p>
            </GlassCard>
          ))
        ) : (
          <GlassCard className="p-2">
            <EmptyState icon="campaign" title={t("portal_no_announcements")} />
          </GlassCard>
        )}
      </Disclosure>

      {property && wifi.data ? (
        <Disclosure icon="wifi" title={t("portal_wifi_title")} trailing={property.wifi_speed}>
          <GlassCard className="relative overflow-hidden p-4">
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/10 blur-2xl" />
            <div className="relative grid grid-cols-2 gap-3">
              <KeyBox label={t("portal_network")} value={wifi.data.wifi_ssid || "-"} icon="router" />
              <KeyBox label={t("wifi_password")} value={wifi.data.wifi_password || "-"} icon="key" />
            </div>
            <div className="relative mt-4 flex items-center gap-2.5">
              <GhostButton onClick={copyPassword} disabled={!wifi.data.wifi_password}>
                <Icon name="content_copy" className="text-[16px]" />
                {t("portal_copy_password")}
              </GhostButton>
              <GhostButton onClick={() => setShowQr(true)} disabled={!wifi.data.wifi_ssid}>
                <Icon name="qr_code_2" className="text-[16px]" />
                {t("portal_qr_share")}
              </GhostButton>
            </div>
          </GlassCard>
        </Disclosure>
      ) : null}

      {contract ? (
        <Disclosure icon="description" title={t("portal_lease_title")} trailing={contract.status === "active" ? t("portal_active_contract") : t(`contract_status_${contract.status}`)}>
          <GlassCard className="flex flex-col gap-2.5 p-4">
            <div className="grid grid-cols-2 gap-2.5">
              <LeaseCell label={t("monthly_rent")} value={money(contract.monthly_rent, locale)} tone="text-primary" icon="payments" />
              <LeaseCell label={t("security_deposit")} value={money(contract.security_deposit, locale)} tone="text-secondary" icon="verified_user" />
              <LeaseCell label={t("lease_start")} value={formatDate(contract.start_date, locale)} icon="calendar_today" />
              <LeaseCell label={t("lease_end")} value={formatDate(contract.end_date, locale)} hint={t("portal_term_months", { count: contract.term_months })} icon="event_available" />
            </div>
            {contract.billing_day ? (
              <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/30 p-3">
                <div className="grid h-8 w-8 place-items-center rounded-lg border border-primary/20 bg-primary/20">
                  <Icon name="event_repeat" className="text-[16px] text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-on-surface">
                    {t("portal_billing_day", { day: locale === "zh" ? contract.billing_day : ordinal(contract.billing_day) })}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">{t("portal_billing_day_hint")}</p>
                </div>
              </div>
            ) : null}
          </GlassCard>

          {contract.agreement ? (
            <GlassCard className="flex items-center gap-3 p-4">
              <IconTile icon="picture_as_pdf" tone="neutral" size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-on-surface">{contract.agreement.name}</p>
                <p className="truncate text-[11px] text-on-surface-variant">
                  {[
                    contract.agreement.signed_at && t("portal_signed_on", { date: formatDate(contract.agreement.signed_at, locale) }),
                    formatBytes(contract.agreement.size_bytes),
                  ]
                    .filter(Boolean)
                    .join(" • ")}
                </p>
              </div>
              {contract.agreement.file_url ? (
                <a
                  href={contract.agreement.file_url}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("portal_download_agreement")}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-surface-container-high text-on-surface hover:bg-white/[0.08]"
                >
                  <Icon name="download" className="text-[18px]" />
                </a>
              ) : (
                <span className="shrink-0 text-[11px] text-on-surface-variant">{t("portal_agreement_pending")}</span>
              )}
            </GlassCard>
          ) : null}
        </Disclosure>
      ) : null}

      <section className="flex flex-col gap-2.5">
        <SectionTitle icon="settings" title={t("portal_settings")} />
        <GlassCard className="flex items-center justify-between gap-3 p-4">
          <span className="text-sm font-semibold text-on-surface">{t("portal_language")}</span>
          <LangSelect />
        </GlassCard>
      </section>

      <QrSheet open={showQr} onClose={() => setShowQr(false)} ssid={wifi.data?.wifi_ssid} password={wifi.data?.wifi_password} />
    </div>
  );
}

function SectionTitle({ icon, title, trailing }) {
  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-2">
        <div className="grid h-6 w-6 place-items-center rounded-lg border border-primary/20 bg-primary/20">
          <Icon name={icon} className="text-[14px] text-primary" />
        </div>
        <span className="text-sm font-bold text-on-surface">{title}</span>
      </div>
      {trailing ? <span className="text-[11px] font-bold text-emerald-300">{trailing}</span> : null}
    </div>
  );
}

function KeyBox({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3">
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
        <Icon name={icon} className="text-[14px]" />
        {label}
      </div>
      <p className="mt-1.5 truncate font-mono text-sm font-bold text-on-surface">{value}</p>
    </div>
  );
}

function LeaseCell({ label, value, hint, tone = "text-on-surface", icon }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-3.5">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">{label}</span>
        <Icon name={icon} className="text-[16px] text-on-surface-variant" />
      </div>
      <p className={`text-sm font-extrabold ${tone}`}>{value}</p>
      {hint ? <p className="mt-0.5 text-[10px] text-on-surface-variant">{hint}</p> : null}
    </div>
  );
}

function QrSheet({ open, onClose, ssid, password }) {
  const { t } = useLocale();
  const [dataUrl, setDataUrl] = useState("");

  useEffect(() => {
    if (!open || !ssid) return undefined;
    let cancelled = false;
    // Encodes the network as a standard Wi-Fi join string. Loaded on demand to keep the page light.
    import("qrcode").then(async (mod) => {
      const QRCode = mod.default ?? mod;
      const url = await QRCode.toDataURL(`WIFI:T:WPA;S:${ssid};P:${password ?? ""};;`, { margin: 1, width: 240, color: { dark: "#0d0e17", light: "#ffffff" } });
      if (!cancelled) setDataUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [open, ssid, password]);

  if (!open) return null;
  return (
    <Sheet open onClose={onClose} icon="qr_code_2" title={t("portal_wifi_connect")} subtitle={ssid} footer={<GhostButton onClick={onClose}>{t("close")}</GhostButton>}>
      <div className="flex flex-col items-center gap-3 py-2">
        {dataUrl ? (
          <img src={dataUrl} alt={t("portal_wifi_connect")} className="h-60 w-60 rounded-2xl bg-white p-3" />
        ) : (
          <div className="h-60 w-60 animate-pulse rounded-2xl bg-white/10" />
        )}
        <p className="text-center text-xs text-on-surface-variant">{t("portal_wifi_scan_hint")}</p>
      </div>
    </Sheet>
  );
}
