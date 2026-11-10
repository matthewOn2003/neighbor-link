import Image from "next/image";
import type { Locale, T } from "@/i18n";
import { portalUrl } from "@/config/site";
import { SvgIcon } from "@/components/ui";

const chipTone = {
  lavender: "bg-lavender text-plum",
  mist: "bg-mist text-sage",
  line: "border border-line bg-white text-muted",
} as const;

export function Hero({ locale, t }: { locale: Locale; t: T }) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <Image src="/design/e56f1.png" alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night via-night/85 to-night/20" />

      <div className="mx-auto flex max-w-site flex-col px-6 pb-7 pt-12 md:px-8 md:pb-16 md:pt-20 lg:h-[720px] xl:h-[800px]">
        <div className="grid flex-1 items-end gap-12 lg:grid-cols-[1fr_22rem]">
          <div className="flex flex-col justify-center lg:pt-auto">
            <p className="kicker text-white/75 before:bg-lilac">{t("hero_eyebrow")}</p>
            <h1 className="display mt-8 text-[46px] md:text-[clamp(3rem,7vw,5.5rem)]">
              <span className="block">{t("hero_title")}</span>
              <span className="block text-lilac">{t("hero_title_b")}</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/85 md:mt-7 md:text-lg">{t("hero_body")}</p>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {/* <a href="#platform" className="btn h-[52px] w-full bg-lilac text-ink hover:bg-lilac/90 sm:w-auto">
                {t("hero_explore")}
                <SvgIcon src="/design/0e2db.svg" size={16} />
              </a> */}
              <a
                href={portalUrl("admin", locale)}
                className="btn h-[52px] w-full bg-lilac text-ink hover:bg-lilac/90 sm:w-auto"
              >
                {t("hero_admin_cta")}
                <SvgIcon src="/design/0e2db.svg" size={16} />
              </a>
              <a
                href={portalUrl("tenant", locale)}
                className="btn btn-outline h-[52px] w-full border-white/40 bg-transparent text-white hover:border-white sm:w-auto"
              >
                {t("hero_tenant_cta")}
                <SvgIcon src="/design/0e2db.svg" size={16} className="brightness-0 invert" />
              </a>
            </div>
          </div>

          <aside className="rounded-xl bg-paper p-[22px] text-ink shadow-2xl md:p-6">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted md:text-[10px]">{t("hero_card_label")}</p>
              <SvgIcon src="/design/0e2db.svg" size={14} />
            </div>
            <p className="mt-5 text-[26px] font-medium tracking-tight md:text-2xl">{t("hero_card_heading")}</p>
            <div className="mt-6 border-t border-line pt-5">
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm font-semibold">{t("hero_card_unit")}</span>
                <span className={`rounded px-2 py-1 text-[11px] font-medium ${chipTone.lavender}`}>{t("hero_card_status")}</span>
              </div>
              <p className="mt-2 text-sm text-muted">{t("hero_card_bill")}</p>
              <p className="mt-4 text-sm leading-relaxed">{t("hero_card_body")}</p>
            </div>
            <p className="mt-6 text-[9px] text-muted md:text-[11px]">{t("hero_caption")}</p>
          </aside>
        </div>

        {/* <div className="mt-12 hidden flex-col gap-3 text-sm text-white/80 lg:mt-16 lg:flex">
          <SvgIcon src="/design/766a5.svg" size={16} className="brightness-0 invert" />
          <p>{t("ft_tagline")}</p>
        </div> */}
      </div>
    </section>
  );
}

export function Intro({ t }: { t: T }) {
  return (
    <section id="platform" className="scroll-mt-24 bg-paper">
      <div className="mx-auto max-w-site px-6 py-[72px] md:px-8 md:py-28">
        <p className="kicker">{t("intro_kicker")}</p>
        <h2 className="display mt-7 max-w-5xl text-[40px] font-medium md:text-6xl">{t("intro_title")}</h2>
        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-20">
          <p className="text-[25px] font-medium leading-tight tracking-tight md:text-3xl">{t("intro_tagline")}</p>
          <p className="text-base leading-relaxed text-muted md:text-lg">{t("intro_body")}</p>
        </div>
      </div>
    </section>
  );
}

const managerRows = [
  { unit: "A-1203", name: "Maya Chen", amount: "RM 1,850.00", status: "mg_status_submitted", tone: chipTone.lavender },
  { unit: "B-0802", name: "Daniel Lee", amount: "RM 1,650.00", status: "mg_status_awaiting", tone: chipTone.line },
  { unit: "A-0905", name: "Sofia Tan", amount: "RM 1,900.00", status: "mg_status_reviewed", tone: chipTone.mist },
] as const;

const managerFeatures = [
  { title: "mg_1_title", desc: "mg_1_desc" },
  { title: "mg_2_title", desc: "mg_2_desc" },
  { title: "mg_3_title", desc: "mg_3_desc" },
  { title: "mg_4_title", desc: "mg_4_desc" },
  { title: "mg_5_title", desc: "mg_5_desc" },
] as const;

export function ManagerSection({ locale, t }: { locale: Locale; t: T }) {
  return (
    <section id="managers" className="scroll-mt-24 bg-night text-white">
      <div className="mx-auto max-w-site px-6 py-[72px] md:px-8 md:py-28">
        <p className="kicker text-white/65 before:bg-lilac">{t("mg_kicker")}</p>
        <div className="mt-7 grid gap-6 lg:grid-cols-[1.3fr_1fr] lg:items-end lg:gap-8">
          <h2 className="display text-[40px] font-medium md:text-6xl">{t("mg_title")}</h2>
          <p className="text-base leading-relaxed text-white/70 md:text-lg">{t("mg_body")}</p>
        </div>

        <figure className="mt-12 md:mt-16">
          <div className="overflow-hidden rounded-xl bg-paper text-ink shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4 text-[10px] font-semibold uppercase tracking-wide md:px-6 md:text-[11px]">
              <span className="flex items-center gap-2">
                <SvgIcon src="/design/09463.svg" size={14} />
                NeighborLink / Manager
              </span>
              <span className="hidden font-medium normal-case text-muted md:inline">{t("mg_table_property")}</span>
            </div>

            <div className="p-5 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[25px] font-medium tracking-tight md:text-2xl">{t("mg_table_heading")}</p>
                  <p className="mt-2 text-xs text-muted">
                    {t("mg_table_property")} / {t("mg_table_period")} / {t("mg_table_submissions")}
                  </p>
                </div>
                <span className="hidden items-center gap-2 rounded-md border border-line bg-white px-3 py-2 text-sm md:flex">
                  {t("mg_table_period")}
                  <SvgIcon src="/design/3443d.svg" size={12} />
                </span>
              </div>

              <div className="mt-6 flex gap-6 overflow-x-auto border-b border-line text-sm text-muted md:mt-8">
                <span className="hidden whitespace-nowrap pb-3 md:block">{t("mg_tab_properties")}</span>
                <span className="hidden whitespace-nowrap pb-3 md:block">{t("mg_tab_tenants")}</span>
                <span className="hidden whitespace-nowrap pb-3 md:block">{t("mg_tab_billing")}</span>
                <span className="-mb-px whitespace-nowrap border-b-2 border-plum pb-3 font-medium text-ink">{t("mg_tab_review")}</span>
              </div>

              <ul className="divide-y divide-line md:hidden">
                {managerRows.map((row) => (
                  <li key={row.unit} className="py-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold">{row.unit}</p>
                        <p className="mt-1 text-xs text-muted">{row.name}</p>
                      </div>
                      <span className={`rounded px-2 py-1 text-[10px] font-medium ${row.tone}`}>{t(row.status)}</span>
                    </div>
                    <div className="mt-4 flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs text-muted">{t("mg_row_bill")}</p>
                        <p className="mt-1 text-xs text-muted">{t("mg_row_due")}</p>
                      </div>
                      <p className="font-medium tabular-nums">{row.amount}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="hidden overflow-x-auto md:block">
                <table className="mt-2 w-full min-w-[36rem] text-left text-sm">
                  <thead className="text-[10px] uppercase tracking-wide text-muted">
                    <tr>
                      <th className="py-4 font-semibold">{t("mg_col_unit")}</th>
                      <th className="py-4 font-semibold">{t("mg_col_bill")}</th>
                      <th className="py-4 font-semibold">{t("mg_col_amount")}</th>
                      <th className="py-4 font-semibold">{t("mg_col_status")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {managerRows.map((row) => (
                      <tr key={row.unit} className="border-t border-line">
                        <td className="py-5">
                          <p className="font-semibold">{row.unit}</p>
                          <p className="text-xs text-muted">{row.name}</p>
                        </td>
                        <td className="py-5">
                          <p>{t("mg_row_bill")}</p>
                          <p className="text-xs text-muted">{t("mg_row_due")}</p>
                        </td>
                        <td className="py-5 tabular-nums">{row.amount}</td>
                        <td className="py-5">
                          <span className={`rounded px-2 py-1 text-[11px] font-medium ${row.tone}`}>{t(row.status)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-lavender px-5 py-4 text-sm">
                <span className="flex items-center gap-3">
                  <SvgIcon src="/design/92d49.svg" size={16} />
                  {t("mg_banner")}
                </span>
                <span className="flex items-center gap-2 font-medium text-plum">
                  {t("mg_banner_action")}
                  <SvgIcon src="/design/0e2db.svg" size={12} />
                </span>
              </div>
            </div>
          </div>
          <figcaption className="mt-4 text-[10px] leading-relaxed text-white/50 md:text-xs">{t("mg_caption")}</figcaption>
        </figure>

        <ol className="mt-12 md:mt-16 lg:grid lg:grid-cols-2 lg:gap-x-16">
          {managerFeatures.map((item, index) => (
            <li key={item.title} className="grid grid-cols-[2.5rem_1fr] border-t border-white/15 py-6 md:py-6">
              <span className="text-[10px] text-white/50">0{index + 1}</span>
              <div>
                <p className="font-medium">{t(item.title)}</p>
                <p className="mt-2 text-sm leading-relaxed text-white/65">{t(item.desc)}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 md:mt-12">
          <a
            href={portalUrl("admin", locale)}
            className="btn btn-light h-[52px] w-full bg-lilac text-ink hover:bg-lilac/90 md:w-auto"
          >
            {t("mg_cta")}
            <SvgIcon src="/design/0e2db.svg" size={16} />
          </a>
          <p className="mt-4 text-sm text-white/50">{t("mg_cta_note")}</p>
        </div>
      </div>
    </section>
  );
}

const tenantFeatures = [
  { title: "tn_1_title", desc: "tn_1_desc" },
  { title: "tn_2_title", desc: "tn_2_desc" },
  { title: "tn_3_title", desc: "tn_3_desc" },
  { title: "tn_4_title", desc: "tn_4_desc" },
] as const;

export function TenantSection({ locale, t }: { locale: Locale; t: T }) {
  return (
    <section id="tenants" className="scroll-mt-24 bg-paper">
      <div className="mx-auto grid max-w-site gap-9 px-6 py-[72px] md:px-8 md:py-28 lg:grid-cols-2 lg:items-start lg:gap-16">
        <div>
          <p className="kicker">{t("tn_kicker")}</p>
          <h2 className="display mt-7 text-[40px] font-medium md:text-5xl">{t("tn_title")}</h2>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted md:text-lg">{t("tn_body")}</p>

          <ol className="mt-12">
            {tenantFeatures.map((item, index) => (
              <li key={item.title} className="grid grid-cols-[2.5rem_1fr] border-t border-line py-6 last:border-b">
                <span className="text-[10px] text-muted md:text-xs">0{index + 1}</span>
                <div>
                  <p className="font-medium">{t(item.title)}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t(item.desc)}</p>
                </div>
              </li>
            ))}
          </ol>

          <a href={portalUrl("tenant", locale)} className="btn btn-outline mt-10 h-[52px] w-full md:w-auto">
            {t("tn_cta")}
            <SvgIcon src="/design/0e2db.svg" size={16} />
          </a>
        </div>

        <figure>
          <div className="relative h-[240px] overflow-hidden rounded-xl md:h-80">
            <Image src="/design/0dcda.png" alt="" fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
          </div>

          <div className="mt-4 rounded-xl border border-line bg-white p-[22px] text-ink md:p-8">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-muted md:text-[10px]">{t("tn_card_label")}</p>
              <SvgIcon src="/design/44f12.svg" size={20} />
            </div>
            <p className="mt-6 text-[28px] font-medium tracking-tight md:text-3xl">{t("tn_card_welcome")}</p>
            <p className="mt-2 text-[10px] uppercase tracking-wide text-muted md:text-[11px]">{t("tn_card_unit")}</p>

            <div className="mt-6 rounded-lg bg-paper p-5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">{t("tn_card_period")}</p>
              <p className="mt-3 text-sm">{t("tn_phone_bill")}</p>
              <p className="mt-1 text-3xl font-medium tracking-tight">RM 1,850.00</p>
              <p className="mt-1 text-xs text-muted">{t("tn_phone_due")}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
                <span className={`rounded px-2 py-1 font-medium ${chipTone.lavender}`}>{t("tn_phone_submitted")}</span>
                <span className="text-muted">{t("tn_phone_awaiting")}</span>
              </div>
              <p className="mt-4 flex items-center gap-2 text-xs font-medium text-plum">
                <SvgIcon src="/design/92d49.svg" size={14} />
                {t("tn_phone_view_proof")}
              </p>
            </div>

            <p className="mt-6 text-sm font-medium">{t("tn_phone_home")}</p>
            <div className="mt-3 divide-y divide-line">
              <div className="flex gap-3 py-4">
                <SvgIcon src="/design/292e5.svg" size={16} className="mt-0.5" />
                <div>
                  <p className="text-sm">{t("tn_phone_request")}</p>
                  <p className="text-xs text-muted">{t("tn_phone_request_detail")}</p>
                </div>
              </div>
              <div className="flex gap-3 py-4">
                <SvgIcon src="/design/3b511.svg" size={16} className="mt-0.5" />
                <div>
                  <p className="text-sm">{t("tn_phone_notice")}</p>
                  <p className="text-xs text-muted">{t("tn_phone_notice_detail")}</p>
                </div>
              </div>
            </div>
          </div>
          <figcaption className="mt-4 text-[10px] leading-relaxed text-muted md:text-xs">{t("tn_caption")}</figcaption>
        </figure>
      </div>
    </section>
  );
}

const steps = [
  { icon: "/design/92d49.svg", role: "hw_role_team", title: "hw_1_title", body: "hw_1_body", state: "hw_1_state", note: "hw_1_note" },
  { icon: "/design/3ab2e.svg", role: "hw_role_tenant", title: "hw_2_title", body: "hw_2_body", state: "hw_2_state", note: "hw_2_note" },
  { icon: "/design/aba44.svg", role: "hw_role_team", title: "hw_3_title", body: "hw_3_body", state: "hw_3_state", note: "hw_3_note" },
  { icon: "/design/363c7.svg", role: "hw_role_shared", title: "hw_4_title", body: "hw_4_body", state: "hw_4_state", note: "hw_4_note" },
] as const;

export function HowItWorks({ t }: { t: T }) {
  return (
    <section className="bg-lavender">
      <div className="mx-auto max-w-site px-6 py-[72px] md:px-8 md:py-28">
        <p className="kicker">{t("hw_kicker")}</p>
        <h2 className="display mt-7 max-w-4xl text-[40px] font-medium md:text-6xl">{t("hw_title")}</h2>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-y border-[#d4cedf] py-4 md:mt-12 md:border-line md:py-5">
          <div className="flex items-center gap-4">
            <SvgIcon src="/design/d7572.svg" size={18} />
            <div>
              <p className="text-sm font-medium">{t("hw_strip_title")}</p>
              <p className="mt-1 text-xs text-muted">{t("hw_strip_meta")}</p>
            </div>
          </div>
          <p className="hidden text-lg font-medium tabular-nums md:block">{t("hw_amount")}</p>
        </div>

        <ol className="mt-4 flex flex-col md:mt-12 md:grid md:grid-cols-2 md:gap-10 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex gap-5 border-t border-[#d4cedf] py-6 md:flex-col md:gap-0 md:border-t-0 md:py-0"
            >
              <span className="w-10 shrink-0 text-4xl font-light text-[#9788ad] md:w-auto md:text-5xl">0{index + 1}</span>
              <div className="flex min-w-0 flex-1 flex-col gap-4 md:gap-0">
                <p className="text-[9px] font-semibold uppercase tracking-wide text-muted md:mt-6 md:text-[10px]">{t(step.role)}</p>
                <p className="text-[22px] font-medium leading-snug tracking-tight md:mt-3 md:text-xl">{t(step.title)}</p>
                <p className="text-[13px] leading-relaxed text-muted md:mb-8 md:mt-3 md:text-sm">{t(step.body)}</p>

                <div className="min-h-[110px] rounded-lg bg-[#f7f5fa] p-4 md:mt-auto">
                  <div className="flex items-center gap-2 text-sm font-medium text-plum md:text-[13px]">
                    <SvgIcon src={step.icon} size={16} />
                    {t(step.state)}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted md:text-xs">{t(step.note)}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p className="mt-10 max-w-3xl text-[10px] leading-relaxed text-muted md:text-xs">{t("hw_caption")}</p>
      </div>
    </section>
  );
}

export function FinalCta({ locale, t }: { locale: Locale; t: T }) {
  return (
    <section className="relative isolate overflow-hidden bg-night text-white">
      <Image src="/design/98a8e.png" alt="" fill sizes="100vw" className="-z-10 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-night/95 to-night/45" />
      <div className="mx-auto max-w-site px-6 py-[72px] md:px-8 md:py-32">
        <p className="kicker text-lilac before:bg-lilac">{t("cta_kicker")}</p>
        <h2 className="display mt-7 max-w-3xl text-[46px] font-medium md:text-7xl">{t("cta_title")}</h2>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-[#e0e0e5] md:text-lg">{t("cta_body")}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={portalUrl("admin", locale)}
            className="btn btn-light h-[52px] w-full bg-lilac text-ink hover:bg-lilac/90 sm:w-auto"
          >
            {t("cta_admin")}
            <SvgIcon src="/design/0e2db.svg" size={16} />
          </a>
          <a
            href={portalUrl("tenant", locale)}
            className="btn btn-outline h-[52px] w-full border-white/45 bg-transparent text-white hover:border-white sm:w-auto"
          >
            {t("cta_tenant")}
            <SvgIcon src="/design/0e2db.svg" size={16} className="brightness-0 invert" />
          </a>
        </div>
      </div>
    </section>
  );
}
