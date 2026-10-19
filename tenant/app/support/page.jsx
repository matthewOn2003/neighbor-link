"use client";

import { useState } from "react";
import PortalShell from "@/app/components/PortalShell";
import { useLocale } from "@/lib/i18n";

export default function SupportPage() {
  const { localeProperties } = useLocale();
  const t = localeProperties.messages;
  const [category, setCategory] = useState("maintenance");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("normal");
  const [submitted, setSubmitted] = useState(null);
  const [error, setError] = useState("");
  function handleSubmit(event) {
    event.preventDefault();
    if (!subject.trim() || !description.trim()) { setError(t.supportValidation); return; }
    setSubmitted({ id: "REQ-" + String(Date.now()).slice(-6), subject: subject.trim(), category, priority });
    setSubject(""); setDescription(""); setError("");
  }
  return (
    <PortalShell>
      <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#d86d43]">NEIGHBOR LINK</p><h1 className="mt-2 text-3xl font-semibold">{t.supportTitle}</h1><p className="mt-2 text-sm text-[#71827c]">{t.supportSubtitle}</p></div>
      <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"><strong>{t.prototypeModeTitle} </strong>{t.supportDemoNotice}</p>
      {submitted ? <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><p className="font-semibold">{t.demoRequestCreated} · {submitted.id}</p><p className="mt-1">{submitted.subject}</p></div> : null}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(260px,0.75fr)]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-semibold">{t.createSupportRequest}</h2>
          <label className="block text-sm font-semibold">{t.requestType}<select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-[#dce6e1] bg-white px-3 font-normal outline-none focus:border-[#526e61] focus:ring-2 focus:ring-[#dce9e1]"><option value="maintenance">{t.maintenanceRepairs}</option><option value="access">{t.accessVisitors}</option><option value="billing">{t.billingQuestion}</option><option value="other">{t.otherEnquiry}</option></select></label>
          <label className="block text-sm font-semibold">{t.subject}<input value={subject} onChange={(e) => setSubject(e.target.value)} maxLength={100} placeholder={t.subjectPlaceholder} className="mt-2 min-h-11 w-full rounded-lg border border-[#dce6e1] px-3 font-normal outline-none focus:border-[#526e61] focus:ring-2 focus:ring-[#dce9e1]" /></label>
          <label className="block text-sm font-semibold">{t.details}<textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} maxLength={1500} placeholder={t.detailsPlaceholder} className="mt-2 w-full resize-y rounded-lg border border-[#dce6e1] px-3 py-3 font-normal leading-6 outline-none focus:border-[#526e61] focus:ring-2 focus:ring-[#dce9e1]" /><span className="mt-1 block text-right text-xs font-normal text-[#83918c]">{description.length}/1500</span></label>
          <fieldset><legend className="text-sm font-semibold">{t.priority}</legend><div className="mt-3 flex flex-wrap gap-3"><label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#dce6e1] px-3 py-2 text-sm"><input type="radio" name="priority" value="normal" checked={priority === "normal"} onChange={() => setPriority("normal")} />{t.normal}</label><label className="flex cursor-pointer items-center gap-2 rounded-lg border border-[#f1c8bf] px-3 py-2 text-sm text-[#9b3828]"><input type="radio" name="priority" value="urgent" checked={priority === "urgent"} onChange={() => setPriority("urgent")} />{t.urgent}</label></div></fieldset>
          {error ? <p role="alert" className="text-sm text-red-700">{error}</p> : null}<button type="submit" className="w-full rounded-lg bg-[#18322e] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#315b4c] sm:w-auto">{t.submitRequest}</button>
        </form>
        <aside className="space-y-4"><section className="rounded-2xl border border-[#e0e8e4] bg-white p-5 shadow-sm"><h2 className="font-semibold">{t.recentSupportRequests}</h2>{submitted ? <div className="mt-4 rounded-xl bg-[#f4f7f5] p-4"><div className="flex items-center justify-between gap-2"><span className="text-xs font-semibold text-[#71827c]">{submitted.id}</span><span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">{submitted.priority === "urgent" ? t.urgent : t.normal}</span></div><p className="mt-2 text-sm font-semibold">{submitted.subject}</p><p className="mt-1 text-xs text-[#71827c]">{t.justNowAwaitingReview}</p></div> : <p className="mt-3 rounded-xl bg-[#f4f7f5] p-4 text-sm text-[#71827c]">{t.noSupportRequests}</p>}</section>
          <section className="rounded-2xl bg-[#18322e] p-5 text-white"><p className="text-xs font-bold uppercase tracking-wider text-[#b9d2c7]">{t.urgentIssue}</p><h2 className="mt-3 font-semibold">{t.safetyOrAccessConcern}</h2><p className="mt-2 text-sm leading-6 text-[#d4e1db]">{t.supportNotMonitored}</p></section></aside>
      </div>
    </PortalShell>
  );
}
