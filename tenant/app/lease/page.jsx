"use client";

import PortalShell from "@/app/components/PortalShell";
import { useLocale } from "@/lib/i18n";

export default function LeasePage() {
  const { localeProperties } = useLocale();
  const zh = localeProperties.code === "zh";
  const text = localeProperties.messages;
  const terms = [
    [zh ? "租约开始" : "Lease starts", "01 Mar 2026"],
    [zh ? "租约结束" : "Lease ends", "28 Feb 2027"],
    [zh ? "月租" : "Monthly rent", "RM 1,800.00"],
    [zh ? "押金" : "Security deposit", "RM 3,600.00"],
    [zh ? "付款日" : "Rent due", zh ? "每月 1 日" : "1st of each month"],
    [zh ? "租约状态" : "Agreement status", zh ? "有效" : "Active"],
  ];
  return (
    <PortalShell>
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d86d43]">NEIGHBOR LINK</p><h1 className="mt-2 text-3xl font-semibold">{zh ? "租约协议" : "Lease agreement"}</h1><p className="mt-2 text-sm text-[#71827c]">{zh ? "租期、租金与重要条款一览。" : "Your lease dates, rent schedule, and key terms at a glance."}</p></div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"><strong>{zh ? "测试数据：" : "Prototype data: "}</strong>{zh ? "此页面内容为虚构示例，不能代替已签署的租约文件。" : "All details are illustrative and do not replace your signed lease."}</p>
      <section className="rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">{zh ? "租赁中" : "Active tenancy"}</span><h2 className="mt-4 text-xl font-semibold">{zh ? "Maple Residences · B-12-08" : "Maple Residences · B-12-08"}</h2><p className="mt-1 text-sm text-[#71827c]">{zh ? "租约编号：NL-LEASE-2026-001" : "Agreement reference: NL-LEASE-2026-001"}</p></div><div className="rounded-xl bg-[#f4f7f5] p-4 sm:min-w-48"><p className="text-xs text-[#71827c]">{zh ? "月租金额" : "Monthly rent"}</p><p className="mt-1 text-2xl font-semibold">RM 1,800.00</p><p className="mt-1 text-xs text-[#71827c]">{zh ? "每月 1 日到期" : "Due on the 1st"}</p></div></div>
        <div className="mt-6 grid gap-0 border-t border-[#edf1ee] sm:grid-cols-2 lg:grid-cols-3">{terms.map(([label, value]) => <div key={label} className="border-b border-[#edf1ee] py-4 sm:px-3"><p className="text-xs text-[#83918c]">{label}</p><p className="mt-2 text-sm font-semibold">{value}</p></div>)}</div>
      </section>
      <section className="rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm sm:p-6"><h2 className="text-lg font-semibold">{zh ? "租约重要事项" : "Important reminders"}</h2><ul className="mt-4 space-y-3 text-sm leading-6 text-[#52645d]"><li className="flex gap-3"><span className="text-[#d86d43]">•</span>{zh ? "如需续租或退租，请提前与管理处沟通。" : "Contact property management early if you plan to renew or end your tenancy."}</li><li className="flex gap-3"><span className="text-[#d86d43]">•</span>{zh ? "请保留租金和押金相关的付款记录。" : "Keep records of rent and deposit payments."}</li><li className="flex gap-3"><span className="text-[#d86d43]">•</span>{zh ? "正式租约文件下载功能尚未接入。" : "Downloadable signed documents are not connected yet."}</li></ul></section>
    </PortalShell>
  );
}
