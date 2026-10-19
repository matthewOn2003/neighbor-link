"use client";

import { useLocale } from "@/lib/i18n";
import PortalShell from "@/app/components/PortalShell";
import FeatureCard from "@/app/components/FeatureCard";

const modules = [
  { key: "rental", href: "/property", icon: "⌂", titleKey: "moduleRental", descriptionKey: "moduleRentalDescription" },
  { key: "contract", href: "/lease", icon: "▤", titleKey: "moduleContract", descriptionKey: "moduleContractDescription" },
  { key: "billing", href: "/billing", icon: "＄", titleKey: "moduleBilling", descriptionKey: "moduleBillingDescription" },
  { key: "support", href: "/support", icon: "♡", titleKey: "moduleSupport", descriptionKey: "moduleSupportDescription" },
];

export default function DashboardPage() {
  const { localeProperties } = useLocale();
  const text = localeProperties.messages;
  const zh = localeProperties.code === "zh";

  return (
    <PortalShell>
      <section className="relative overflow-hidden rounded-2xl bg-[#18322e] p-6 text-white shadow-sm sm:p-8">
        <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full border-[36px] border-white/5" />
        <div className="relative">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#b9d2c7]">{text.overview}</p>
          <div className="mt-3 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{text.welcomeTitle}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#d4e1db]">{text.welcomeDescription}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-[#e2eee8]">
              <span className="h-2 w-2 rounded-full bg-[#a6d5b8]" />{text.accountPortal}
            </span>
          </div>
        </div>
      </section>

      <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
        <span aria-hidden="true" className="mt-0.5">ⓘ</span>
        <p><strong>{zh ? "早期测试版本。" : "Early test build. "}</strong>{zh ? "下面的租赁、账单和请求内容均为演示数据；不会触发真实付款或管理流程。" : "Rental, billing, and request content is sample data. No real payments or management workflows are triggered."}</p>
      </div>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm"><p className="text-sm text-[#71827c]">{zh ? "我的单元" : "My unit"}</p><p className="mt-2 text-xl font-semibold">B-12-08</p><p className="mt-1 text-xs text-[#83918c]">Maple Residences</p></div>
        <div className="rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm"><p className="text-sm text-[#71827c]">{zh ? "示例月租" : "Sample monthly rent"}</p><p className="mt-2 text-xl font-semibold">RM 1,800.00</p><p className="mt-1 text-xs text-[#83918c]">{zh ? "每月 1 日到期" : "Due on the 1st"}</p></div>
        <div className="rounded-2xl border border-[#f1d4c9] bg-[#fff7f3] p-5 shadow-sm"><p className="text-sm text-[#9b5439]">{zh ? "示例待付账单" : "Sample outstanding bill"}</p><p className="mt-2 text-xl font-semibold text-[#9b5439]">RM 1,800.00</p><a href="/billing" className="mt-1 inline-block text-xs font-semibold text-[#9b5439] underline">{zh ? "查看账单 →" : "Review billing →"}</a></div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div><h2 className="text-xl font-semibold">{text.homeOverview}</h2><p className="mt-1 text-sm text-[#71827c]">{text.homeOverviewDescription}</p></div>
          <span className="text-xs text-[#83918c]">{zh ? "4 项服务" : "4 resident services"}</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {modules.map((module) => <FeatureCard key={module.key} href={module.href} icon={module.icon} title={text[module.titleKey]} description={text[module.descriptionKey]} status={text.comingSoon} />)}
        </div>
      </section>

      <section className="rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-semibold">{zh ? "下一步" : "Suggested next steps"}</h2><p className="mt-1 text-sm text-[#71827c]">{zh ? "熟悉租客端的主要入口。" : "Explore the main areas of your tenant portal."}</p></div><span className="text-xl" aria-hidden="true">✦</span></div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2"><a href="/lease" className="flex items-center justify-between rounded-xl bg-[#f4f7f5] p-4 text-sm font-semibold transition hover:bg-[#edf4f0]"><span>{zh ? "检查租期和付款日" : "Check lease dates and due date"}</span><span aria-hidden="true">→</span></a><a href="/support" className="flex items-center justify-between rounded-xl bg-[#f4f7f5] p-4 text-sm font-semibold transition hover:bg-[#edf4f0]"><span>{zh ? "试用维修请求表单" : "Try the maintenance request form"}</span><span aria-hidden="true">→</span></a></div>
      </section>
    </PortalShell>
  );
}
