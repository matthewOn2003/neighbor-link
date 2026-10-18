"use client";

import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import {
  dashboardActions,
  dashboardComplaints,
  dashboardExpiringContracts,
  dashboardFeatureCard,
  dashboardKpis,
  dashboardOccupancy,
  dashboardOutstandingBills,
  dashboardRevenue,
} from "@/mock/dashboard";

const activeToggleClassName = "px-3 py-1 rounded-lg bg-accent text-scene-content shadow font-semibold";
const inactiveToggleClassName = "px-3 py-1 rounded-lg text-subtle hover:text-scene-content";

export default function DashboardPage() {
  const [selectedRevenuePeriod, setSelectedRevenuePeriod] = useState("monthly");
  const activeRevenueSeries = dashboardRevenue.series[selectedRevenuePeriod];

  return (
    <></>
    // <main aria-label="Admin dashboard" className="flex flex-col w-full p-6 lg:p-8 space-y-6">
    //   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    //     <div className="flex flex-col">
    //       <div className="flex items-center gap-2">
    //         <h1 className="text-3xl font-semibold text-scene-content">Dashboard Overview</h1>
    //         <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-scene text-primary text-xs font-semibold">Live Sync</span>
    //       </div>
    //       <p className="text-sm font-normal text-subtle mt-1">Real-time property metrics, revenue trends, and operational tasks.</p>
    //     </div>

    //     <div className="flex items-center gap-3">
    //       {dashboardActions.map((action) => (
    //         <Link key={action.id} href={action.href} className={action.className}>
    //           <Icon name={action.icon} className="text-lg" />
    //           <span className="">{action.label}</span>
    //         </Link>
    //       ))}
    //     </div>
    //   </div>

    //   <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
    //     {dashboardKpis.map((item) => (
    //       <div key={item.id} className={item.cardClassName}>
    //         <div className="flex items-start justify-between">
    //           <div className={item.iconWrapClassName}>
    //             <Icon name={item.icon} className="text-[22px]" />
    //           </div>
    //           <span className={item.badgeClassName}>
    //             {item.badgeIcon ? <Icon name={item.badgeIcon} className="text-sm" /> : null}
    //             {item.badgeText}
    //           </span>
    //         </div>
    //         <div className="mt-4">
    //           <span className={item.labelClassName}>{item.label}</span>
    //           <div className={item.valueRowClassName}>
    //             {item.prefix ? <span className={item.prefixClassName}>{item.prefix}</span> : null}
    //             <span className={item.valueClassName}>{item.value}</span>
    //             {item.valueSuffix ? <span className={item.valueSuffixClassName}>{item.valueSuffix}</span> : null}
    //           </div>
    //         </div>
    //         <div className={item.footerClassName}>
    //           {item.footerItems.map((footerItem) => (
    //             <span key={footerItem.id} className={`flex items-center gap-2${footerItem.textClassName ? ` ${footerItem.textClassName}` : ""}`.trim()}>
    //               {footerItem.dotClassName ? <span className={footerItem.dotClassName}></span> : null}
    //               {footerItem.label}
    //             </span>
    //           ))}
    //         </div>
    //       </div>
    //     ))}
    //   </div>

    //   <div className="bg-accent rounded-2xl p-4 shadow overflow-hidden flex flex-col md:flex-row items-center gap-6">
    //     <div className="w-full md:w-5/12 h-44 rounded-xl overflow-hidden bg-primary/10 flex items-center justify-center">
    //       <img alt={dashboardFeatureCard.imageAlt} className="w-full h-full object-cover" src={dashboardFeatureCard.image} />
    //     </div>
    //     <div className="w-full md:w-7/12 flex flex-col justify-center space-y-2">
    //       <div className="flex items-center gap-2">
    //         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-scene text-primary text-xs font-semibold">{dashboardFeatureCard.badge}</span>
    //         <span className="text-xs font-semibold text-subtle">{dashboardFeatureCard.meta}</span>
    //       </div>
    //       <h2 className="text-lg font-semibold text-scene-content">{dashboardFeatureCard.title}</h2>
    //       <p className="text-sm font-normal text-subtle">{dashboardFeatureCard.description}</p>
    //     </div>
    //   </div>

    //   <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
    //     <div className="lg:col-span-8 flex flex-col space-y-6">
    //       <div className="bg-accent rounded-2xl p-6 shadow flex flex-col">
    //         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
    //           <div>
    //             <h3 className="text-lg font-semibold text-scene-content">Revenue Overview</h3>
    //             <p className="text-xs font-normal text-subtle mt-0.5">Monthly distribution of rental revenue vs extra utility fees</p>
    //           </div>

    //           <div className="flex items-center gap-3">
    //             <div className="flex items-center gap-4 text-xs font-semibold mr-2 hidden sm:flex">
    //               <span className="flex items-center gap-2 text-scene-content">
    //                 <span className="w-3 h-3 rounded bg-primary-dark"></span>Rental
    //               </span>
    //               <span className="flex items-center gap-2 text-subtle">
    //                 <span className="w-3 h-3 rounded bg-[#dce9ff]"></span>Extra Fees
    //               </span>
    //             </div>
    //             <div className="inline-flex p-1 rounded-xl bg-primary/10 text-subtle text-xs font-semibold">
    //               {dashboardRevenue.periods.map((period) => (
    //                 <button
    //                   key={period.id}
    //                   type="button"
    //                   className={selectedRevenuePeriod === period.id ? activeToggleClassName : inactiveToggleClassName}
    //                   onClick={() => setSelectedRevenuePeriod(period.id)}
    //                 >
    //                   {period.label}
    //                 </button>
    //               ))}
    //             </div>
    //           </div>
    //         </div>

    //         <div className="w-full h-64 relative flex items-end justify-between pt-6 pb-2 px-2 bg-primary/10/30 rounded-xl">
    //           <div className="absolute inset-0 flex flex-col justify-between py-6 px-4 pointer-events-none opacity-40">
    //             {[1, 2, 3, 4].map((gridLine) => (
    //               <div key={gridLine} className="w-full border-b border-[#dce9ff]"></div>
    //             ))}
    //           </div>

    //           {activeRevenueSeries.bars.map((bar) => (
    //             <div key={bar.id} className="flex flex-col items-center gap-2 z-10 flex-1">
    //               <div className="flex items-end gap-1 h-44">
    //                 <div className="w-3.5 bg-primary-dark rounded-t-sm transition-all hover:opacity-80" style={{ height: bar.rentalHeight }} title={bar.rentalTitle}></div>
    //                 <div className={bar.extraBarClassName || "w-3.5 bg-[#dce9ff] rounded-t-sm transition-all hover:opacity-80"} style={{ height: bar.extraHeight }} title={bar.extraTitle}></div>
    //               </div>
    //               <span className={bar.labelClassName || "text-xs font-semibold text-subtle"}>{bar.label}</span>
    //             </div>
    //           ))}
    //         </div>
    //         <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-4 text-xs font-normal text-subtle">
    //           <div className="flex items-center gap-2">
    //             <Icon name="verified" className="text-success" />
    //             <span className="">{activeRevenueSeries.trendText}</span>
    //           </div>
    //           <span className="text-xs font-medium text-subtle">{activeRevenueSeries.reportGenerated}</span>
    //         </div>
    //       </div>

    //       <div className="bg-accent rounded-2xl p-6 shadow flex flex-col">
    //         <div className="flex items-center justify-between mb-4">
    //           <div>
    //             <h3 className="text-lg font-semibold text-scene-content">Outstanding Bills</h3>
    //             <p className="text-xs font-normal text-subtle">Require follow-up notice or immediate payment recording</p>
    //           </div>
    //           <Link className="text-xs font-semibold text-primary-dark hover:underline flex items-center gap-1" href="/bills">
    //             <span className="">View All Bills</span>
    //             <Icon name="arrow_forward" />
    //           </Link>
    //         </div>
    //         <div className="overflow-x-auto -mx-6 px-6">
    //           <table className="w-full text-left">
    //             <thead>
    //               <tr className="bg-primary/10 text-subtle text-xs font-semibold uppercase">
    //                 <th className="py-3 px-4 rounded-l-xl">Invoice</th>
    //                 <th className="py-3 px-4">Tenant / Property</th>
    //                 <th className="py-3 px-4">Amount</th>
    //                 <th className="py-3 px-4">Due Date</th>
    //                 <th className="py-3 px-4">Status</th>
    //                 <th className="py-3 px-4 text-right rounded-r-xl">Quick Action</th>
    //               </tr>
    //             </thead>
    //             <tbody className="divide-y divide-primary/10 text-sm font-normal">
    //               {dashboardOutstandingBills.map((bill) => (
    //                 <tr key={bill.id} className="hover:bg-primary/10/40 transition-colors">
    //                   <td className="py-3.5 px-4 text-xs font-semibold text-scene-content">#{bill.id}</td>
    //                   <td className="py-3.5 px-4">
    //                     <div className="flex flex-col">
    //                       <span className="text-xs font-semibold text-scene-content">{bill.tenant}</span>
    //                       <span className="text-xs font-normal text-subtle">{bill.property}</span>
    //                     </div>
    //                   </td>
    //                   <td className="py-3.5 px-4 text-lg font-semibold text-scene-content">{bill.amount}</td>
    //                   <td className="py-3.5 px-4 text-xs font-normal text-subtle">{bill.dueDate}</td>
    //                   <td className="py-3.5 px-4">
    //                     <span className={bill.statusClassName}>
    //                       <span className={bill.statusDotClassName}></span>
    //                       {bill.statusLabel}
    //                     </span>
    //                   </td>
    //                   <td className="py-3.5 px-4 text-right">
    //                     <div className="flex items-center justify-end gap-2">
    //                       <button type="button" className={bill.recordButtonClassName}>Record Payment</button>
    //                       <button type="button" className="p-2 rounded-lg bg-primary/10 text-subtle hover:text-scene-content transition-all">
    //                         <Icon name="visibility" className="text-lg" />
    //                       </button>
    //                     </div>
    //                   </td>
    //                 </tr>
    //               ))}
    //             </tbody>
    //           </table>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="lg:col-span-4 flex flex-col space-y-6">
    //       <div className="bg-accent rounded-2xl p-6 shadow flex flex-col">
    //         <div className="flex items-center justify-between mb-4">
    //           <h3 className="text-lg font-semibold text-scene-content">Occupancy Rate</h3>
    //           <Icon name="donut_large" className="text-subtle text-[20px]" />
    //         </div>
    //         <div className="flex items-center gap-6">
    //           <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
    //             <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
    //               <path className="text-primary/10 stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3.5"></path>
    //               <path className="text-primary-dark stroke-current" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeDasharray={dashboardOccupancy.dashArray} strokeLinecap="round" strokeWidth="3.5"></path>
    //             </svg>
    //             <div className="absolute flex flex-col items-center justify-center text-center">
    //               <span className="text-[22px] font-semibold text-scene-content">{dashboardOccupancy.value}</span>
    //               <span className="text-xs font-semibold text-subtle mt-0.5">{dashboardOccupancy.label}</span>
    //             </div>
    //           </div>

    //           <div className="flex flex-col space-y-2 flex-1 text-xs font-normal">
    //             {dashboardOccupancy.breakdown.map((item) => (
    //               <div key={item.id} className="flex items-center justify-between">
    //                 <span className="flex items-center gap-2 text-subtle">
    //                   <span className={item.dotClassName}></span>{item.label}
    //                 </span>
    //                 <span className="text-xs font-semibold text-scene-content">{item.value}</span>
    //               </div>
    //             ))}
    //           </div>
    //         </div>
    //         <div className="mt-4 pt-3 bg-primary/10/60 rounded-xl p-3 flex items-center justify-between text-subtle text-xs font-normal">
    //           <span className="">Portfolio Capacity:</span>
    //           <span className="text-xs font-semibold text-scene-content">{dashboardOccupancy.totalLabel}</span>
    //         </div>
    //       </div>

    //       <div className="bg-accent rounded-2xl p-6 shadow flex flex-col">
    //         <div className="flex items-center justify-between mb-4">
    //           <div>
    //             <h3 className="text-lg font-semibold text-scene-content">Expiring Contracts</h3>
    //             <span className="text-xs font-semibold text-subtle">Next 30 Days</span>
    //           </div>
    //           <span className="px-2 py-0.5 rounded-full bg-[#fffbeb] text-highlight text-xs font-semibold">{dashboardExpiringContracts.badge}</span>
    //         </div>
    //         <div className="flex flex-col space-y-3">
    //           {dashboardExpiringContracts.items.map((contract) => (
    //             <div key={contract.id} className="p-3 rounded-xl bg-primary/10/50 flex items-center justify-between hover:bg-primary/10 transition-colors">
    //               <div className="flex flex-col">
    //                 <div className="flex items-center gap-2">
    //                   <span className="text-xs font-semibold text-scene-content">#{contract.id}</span>
    //                   <span className={contract.daysClassName}>{contract.daysLeft}</span>
    //                 </div>
    //                 <span className="text-sm text-scene-content font-medium mt-1">{contract.tenant}</span>
    //                 <span className="text-xs font-normal text-subtle">{contract.property}</span>
    //               </div>
    //               <button type="button" className={contract.buttonClassName}>Renew</button>
    //             </div>
    //           ))}
    //         </div>
    //       </div>

    //       <div className="bg-accent rounded-2xl p-6 shadow flex flex-col">
    //         <div className="flex items-center justify-between mb-4">
    //           <div className="flex items-center gap-2">
    //             <h3 className="text-lg font-semibold text-scene-content">Complaints Queue</h3>
    //             <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
    //           </div>
    //           <span className="text-xs font-semibold text-subtle">{dashboardComplaints.openTicketsLabel}</span>
    //         </div>
    //         <div className="flex flex-col space-y-3">
    //           {dashboardComplaints.items.map((complaint) => (
    //             <div key={complaint.id} className="p-3 rounded-xl bg-primary/10/50 flex items-start gap-3 hover:bg-primary/10 transition-colors">
    //               <div className={complaint.iconWrapClassName}>
    //                 <Icon name={complaint.icon} className="text-lg" />
    //               </div>
    //               <div className="flex-1 min-w-0">
    //                 <div className="flex items-center justify-between">
    //                   <span className="text-xs font-semibold text-scene-content truncate">{complaint.title}</span>
    //                   <span className={complaint.priorityClassName}>{complaint.priority}</span>
    //                 </div>
    //                 <p className="text-xs font-normal text-subtle truncate mt-0.5">{complaint.description}</p>
    //               </div>
    //             </div>
    //           ))}
    //         </div>
    //         <button type="button" className="mt-4 w-full py-2.5 rounded-xl bg-primary/10 text-scene-content text-xs font-semibold hover:bg-[#dce9ff] transition-colors flex items-center justify-center gap-2">
    //           <span className="">Manage All Complaints</span>
    //           <Icon name="arrow_right_alt" className="text-lg" />
    //         </button>
    //       </div>
    //     </div>
    //   </div>
    // </main>
  );
}
