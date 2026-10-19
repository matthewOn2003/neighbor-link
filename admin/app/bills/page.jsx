"use client";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { Icon } from "@/components/ui/Icon";
import { Spinner } from "@/components/ui/Spinner";
import { SearchBar } from "@/components/ui/SearchBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { request } from "@/services/request";
import { useToast } from "@/components/ui";
import { useRequest } from "@/hooks/useRequest";
import { useLocale } from "@/i18n";
const money=v=>"RM "+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
const statusKeys={unpaid:"bill_status_unpaid",partial:"bill_status_partial",paid:"bill_status_paid",overdue:"bill_status_overdue",void:"bill_status_void"};
const statusClass={unpaid:"neutral",partial:"warning",paid:"success",overdue:"danger",void:"neutral"};
export default function BillsPage(){
 const {t}=useLocale();const toast=useToast();const [generating,setGenerating]=useState(false);const [input,setInput]=useState("");const [status,setStatus]=useState("");const [period,setPeriod]=useState("");const [page,setPage]=useState(1);const keyword=useDebouncedValue(input.trim(),300);
 const {data,loading,error}=useRequest("/bill/list",{current_page:page,per_page:10,keyword,status,period});
 const rows=data?.list??[];const pg=data?.pagination;const summary=data?.summary??{};
 const filters=["","unpaid","partial","paid","overdue","void"];
 return <main className="flex w-full flex-col gap-6 p-8">
  <header className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold text-scene-content">{t("bills")}</h1><p className="mt-1 text-sm text-subtle">{t("bills_description")}</p></div><div className="flex flex-wrap gap-2"><button type="button" disabled={generating} onClick={async()=>{setGenerating(true);try{const r=await request("/bill/generate",{billing_period:period||new Date().toISOString().slice(0,7)});toast.success(t("bills_generated",{count:r.generated_count}));window.location.reload()}catch{toast.error(t("bill_generate_failed"))}finally{setGenerating(false)}}} className="btn btn-outline disabled:opacity-40">{generating?t("generating_bills"):t("generate_monthly_bills")}</button><Link href="/bills/new" className="btn btn-primary"><Icon name="add" className="text-lg"/>{t("create_bill")}</Link></div></header>
  <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
   {[["bill_total_amount",money(summary.total_amount)],["bill_total_paid",money(summary.total_paid)],["bill_outstanding",money(summary.outstanding)],["bill_overdue_count",String(summary.overdue_count??0)]].map(([key,value])=><div key={key} className="rounded-xl bg-accent p-4 shadow"><p className="text-sm text-subtle">{t(key)}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>)}
  </section>
  <section className="rounded-xl bg-accent p-4 shadow">
   <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="w-full lg:max-w-md"><SearchBar value={input} onChange={v=>{setInput(v);setPage(1)}} placeholder={t("search_bills")}/></div><div className="flex flex-wrap gap-2"><input aria-label={t("billing_period")} type="month" value={period} onChange={e=>{setPeriod(e.target.value);setPage(1)}} className="input min-w-[160px]"/>{filters.map(s=><button key={s||"all"} type="button" onClick={()=>{setStatus(s);setPage(1)}} className={"rounded-lg px-3 py-2 text-sm "+(status===s?"bg-primary text-white":"bg-scene text-subtle")}>{t(s?statusKeys[s]:"all_bill_statuses")}</button>)}</div></div>
   {error?<p role="alert" className="mt-4 text-sm text-error">{error}</p>:null}
   {loading?<div className="flex min-h-48 items-center justify-center"><Spinner size="lg"/></div>:rows.length===0?<div className="p-12 text-center text-sm text-subtle">{t("no_bills")}</div>:<div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-xs uppercase text-subtle"><tr>{["bill_number","tenant","billing_period","due_date","bill_amount","bill_paid","status","action"].map(k=><th key={k} className="px-3 py-3">{t(k)}</th>)}</tr></thead><tbody className="divide-y divide-scene">{rows.map(r=><tr key={r.id}><td className="px-3 py-4 font-semibold"><Link href={"/bills/"+r.id} className="text-primary-dark">BL-{String(r.id).padStart(5,"0")}</Link></td><td className="px-3 py-4">{r.tenant_name}<div className="text-xs text-subtle">{r.property_name||"—"} · {r.unit_code||"—"}</div></td><td className="px-3 py-4">{r.billing_period}</td><td className="px-3 py-4 whitespace-nowrap">{r.due_date}</td><td className="px-3 py-4 whitespace-nowrap">{money(Number(r.amount)+Number(r.late_fee))}</td><td className="px-3 py-4 whitespace-nowrap">{money(r.amount_paid)}</td><td className="px-3 py-4"><span className={"status-pill "+(statusClass[r.status]||"neutral")}>{t(statusKeys[r.status]||statusKeys.unpaid)}</span></td><td className="px-3 py-4 whitespace-nowrap"><Link href={"/bills/"+r.id} className="text-primary-dark">{t("view_details")}</Link></td></tr>)}</tbody></table></div>}
   {pg&&pg.last_page>1?<div className="mt-4 flex items-center justify-between text-sm"><span>{t("pagination_summary",{current:pg.current_page,last:pg.last_page,total:pg.total})}</span><div className="flex gap-2"><button disabled={page<=1} onClick={()=>setPage(page-1)} className="btn btn-outline disabled:opacity-40">{t("previous")}</button><button disabled={page>=pg.last_page} onClick={()=>setPage(page+1)} className="btn btn-outline disabled:opacity-40">{t("next")}</button></div></div>:null}
  </section>
 </main>
}
