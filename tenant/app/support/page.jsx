"use client";

import { useState } from "react";
import PortalShell from "@/app/components/PortalShell";
import { useLocale } from "@/lib/i18n";

export default function SupportPage() {
  const { localeProperties } = useLocale();
  const zh = localeProperties.code === "zh";
  const [category, setCategory] = useState("maintenance");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState("");
  const labels = zh ? { title: "住户支持", subtitle: "提交维修请求或向管理处反馈问题。", category: "请求类型", maintenance: "维修报修", access: "门禁与访客", billing: "账单问题", other: "其他咨询", subject: "主题", subjectPlaceholder: "简单描述你需要什么帮助", description: "详细说明", descriptionPlaceholder: "请提供位置、问题发生时间及其他有帮助的信息", priority: "优先级", normal: "一般", urgent: "紧急", submit: "提交请求", recent: "近期支持记录", empty: "尚无支持记录", success: "已创建演示请求", demo: "测试数据：提交内容只保存在当前页面状态，不会发送给管理处或写入数据库。" } : { title: "Resident support", subtitle: "Request a repair or send a question to property management.", category: "Request type", maintenance: "Maintenance & repairs", access: "Access & visitors", billing: "Billing question", other: "Other enquiry", subject: "Subject", subjectPlaceholder: "Briefly describe what you need help with", description: "Details", descriptionPlaceholder: "Include the location, when it happened, and anything else that may help", priority: "Priority", normal: "Normal", urgent: "Urgent", submit: "Submit request", recent: "Recent support requests", empty: "No support requests yet", success: "Demo request created", demo: "Prototype data: submissions stay in this page's local state. Nothing is sent to management or saved to a database." };
  function handleSubmit(event) {
    event.preventDefault();
    if (!subject.trim() || !description.trim()) {
      setError(zh ? "请填写主题和详细说明。" : "Please enter a subject and details.");
      return;
    }
    setSubmitted({ id: "REQ-" + String(Date.now()).slice(-6), subject: subject.trim(), category, priority });
    setSubject("");
    setDescription("");
    setError("");
  }
  return (
    <PortalShell>
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d86d43]">NEIGHBOR LINK</p><h1 className="mt-2 text-3xl font-semibold">{labels.title}</h1><p className="mt-2 text-sm text-[#71827c]">{labels.subtitle}</p></div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"><strong>{zh ? "测试模式：" : "Prototype mode: "}</strong>{labels.demo}</p>
      {submitted ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><p className="font-semibold">{labels.success} · {submitted.id}</p><p className="mt-1">{submitted.subject}</p></div> : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold">{zh ? "创建支持请求" : "Create a support request"}</h2>
          <label className="block text-sm font-semibold">{labels.category}<select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-[#dce6e1] bg-white px-3 font-normal outline-none focus:border-[#526e61] focus:ring-2 focus:ring-[#dce9e1]"><option value="maintenance">{labels.maintenance}</option><option value="access">{labels.access}</option><option value="billing">{labels.billing}</option><option value="other">{labels.other}</option></select></label>
          <label className="block text-sm font-semibold">{labels.subject}<input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={100} placeholder={labels.subjectPlaceholder} className="mt-2 min-h-11 w-full rounded-lg border border-[#dce6e1] px-3 font-normal outline-none focus:border-[#526e61] focus:ring-2 focus:ring-[#dce9e1]" /></label>
          <label className="block text-sm font-semibold">{labels.description}<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={1500} placeholder={labels.descriptionPlaceholder} className="mt-2 w-full resize-y rounded-lg border border-[#dce6e1] px-3 py-3 font-normal leading-6 outline-none focus:border-[#526e61] focus:ring-2 focus:ring-[#dce9e1]" /><span className="mt-1 block text-right text-xs font-normal text-[#83918c]">{description.length}/1500</span></label>
          <fieldset><legend className="text-sm font-semibold">{labels.priority}</legend><div className="mt-3 flex flex-wrap gap-3"><label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#dce6e1] px-3 py-2 text-sm"><input type="radio" name="priority" value="normal" checked={priority === "normal"} onChange={() => setPriority("normal")} />{labels.normal}</label><label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#f1c8bf] px-3 py-2 text-sm text-[#9b3828]"><input type="radio" name="priority" value="urgent" checked={priority === "urgent"} onChange={() => setPriority("urgent")} />{labels.urgent}</label></div></fieldset>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}
          <button type="submit" className="w-full rounded-lg bg-[#18322e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#315b4c] sm:w-auto">{labels.submit}</button>
        </form>
        <aside className="space-y-4">
          <section className="rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm"><h2 className="font-semibold">{labels.recent}</h2>{submitted ? <div className="mt-4 rounded-xl bg-[#f4f7f5] p-4"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-[#71827c]">{submitted.id}</span><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">{submitted.priority === "urgent" ? labels.urgent : labels.normal}</span></div><p className="mt-2 text-sm font-semibold">{submitted.subject}</p><p className="mt-1 text-xs text-[#71827c]">{zh ? "刚刚 · 等待处理（仅演示）" : "Just now · Awaiting review (demo only)"}</p></div> : <p className="mt-3 rounded-xl bg-[#f4f7f5] p-4 text-sm text-[#71827c]">{labels.empty}</p>}</section>
          <section className="rounded-2xl bg-[#18322e] p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-[#b9d2c7]">{zh ? "紧急情况" : "Urgent issue?"}</p><h2 className="mt-3 font-semibold">{zh ? "影响安全或无法进入住所？" : "Safety or access concern?"}</h2><p className="mt-2 text-sm leading-6 text-[#d4e1db]">{zh ? "此测试门户不提供实时值班服务。请直接联系大楼管理处或当地紧急服务。" : "This prototype is not monitored. Contact building management or local emergency services directly."}</p></section>
        </aside>
      </div>
    </PortalShell>
  );
}
