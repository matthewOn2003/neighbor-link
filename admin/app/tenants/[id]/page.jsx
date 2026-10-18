"use client";

import Link from "next/link";
import { use, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { getTenantDetail } from "@/mock/tenantDetail";

const tabs = [
  { key: "overview", label: "Overview", icon: "space_dashboard" },
  {
    key: "contract",
    label: "Contract",
    icon: "contract",
    badgeClassName: "px-2 py-0.5 rounded-full bg-scene text-primary text-xs font-semibold",
    getBadgeLabel: (tenant) => tenant.overviewStats.contractCountLabel,
  },
  {
    key: "bills",
    label: "Bills",
    icon: "receipt_long",
    badgeClassName: "px-2 py-0.5 rounded-full bg-[#e5eeff] text-subtle text-xs font-semibold",
    getBadgeLabel: (tenant) => tenant.overviewStats.billsCountLabel,
  },
  {
    key: "payments",
    label: "Payments",
    icon: "paid",
    badgeClassName: "px-2 py-0.5 rounded-full bg-[#e5eeff] text-subtle text-xs font-semibold",
    getBadgeLabel: (tenant) => tenant.overviewStats.paymentsCountLabel,
  },
  {
    key: "complaints",
    label: "Complaints",
    icon: "feedback",
    badgeClassName: "px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-xs font-semibold",
    getBadgeLabel: (tenant) => tenant.overviewStats.complaintsCountLabel,
  },
];

function getInvoiceStatusClasses(status) {
  if (status === "Paid") {
    return {
      badge: "px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold flex items-center gap-1",
      dot: "w-2 h-2 rounded-full bg-success",
      amount: "text-lg font-semibold text-scene-content",
      metaIcon: "event_available",
    };
  }

  return {
    badge: "px-2 py-0.5 rounded-full bg-[#fffbeb] text-highlight text-xs font-semibold flex items-center gap-1",
    dot: "w-2 h-2 rounded-full bg-highlight",
    amount: "text-lg font-semibold text-scene-content",
    metaIcon: "schedule",
  };
}

function getBillStatusClasses(status) {
  if (status === "Paid") {
    return "px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold";
  }

  if (status === "Overdue") {
    return "px-2 py-0.5 rounded-full bg-[#fff1f2] text-error text-xs font-semibold";
  }

  return "px-2 py-0.5 rounded-full bg-[#fffbeb] text-highlight text-xs font-semibold";
}

function getOutstandingStyles(value) {
  if (value === "RM 0.00") {
    return {
      amount: "text-2xl text-success font-semibold",
      badge: "px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold",
      iconWrap: "w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-success",
      icon: "task_alt",
    };
  }

  return {
    amount: "text-2xl text-highlight font-semibold",
    badge: "px-2 py-0.5 rounded-full bg-[#fffbeb] text-highlight text-xs font-semibold",
    iconWrap: "w-8 h-8 rounded-lg bg-[#fffbeb] flex items-center justify-center text-highlight",
    icon: "schedule",
  };
}

function getTimelineClasses(tone) {
  if (tone === "success") {
    return {
      outer: "absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#ecfdf5] ring-4 ring-accent flex items-center justify-center",
      inner: "w-2 h-2 rounded-full bg-success",
    };
  }

  if (tone === "neutral") {
    return {
      outer: "absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#f1f5f9] ring-4 ring-accent flex items-center justify-center",
      inner: "w-2 h-2 rounded-full bg-[#475569]",
    };
  }

  if (tone === "muted") {
    return {
      outer: "absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#e5eeff] ring-4 ring-accent flex items-center justify-center",
      inner: "w-2 h-2 rounded-full bg-subtle",
    };
  }

  return {
    outer: "absolute -left-[27px] top-1 w-4 h-4 rounded-full bg-[#e5eeff] ring-4 ring-accent flex items-center justify-center",
    inner: "w-2 h-2 rounded-full bg-primary-dark",
  };
}

function renderTimelineDescription(item) {
  if (!item.highlight) {
    return item.description;
  }

  const [before, after] = item.description.split(item.highlight);

  return (
    <>
      {before}
      <span className="text-primary-dark font-semibold">{item.highlight}</span>
      {after}
    </>
  );
}

function OverviewPanel({ tenant }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-7 flex flex-col gap-6">
        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex items-center justify-between pb-2 mb-4 bg-[#ffffff]">
            <div className="flex items-center gap-2">
              <Icon name="badge" className="text-primary-dark text-[22px]" aria-hidden="true" />
              <h2 className="text-lg text-scene-content font-semibold">Personal Dossier</h2>
            </div>
            <button type="button" className="text-primary-dark hover:text-[#2f2ebe] text-xs flex items-center gap-1 font-semibold">
              <Icon name="edit" aria-hidden="true" />
              <span>Edit Details</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 p-2 bg-primary/10/70 rounded-xl">
              <span className="text-xs font-semibold text-subtle uppercase">Full Legal Name</span>
              <span className="text-sm text-scene-content font-medium">{tenant.profile.legalName}</span>
            </div>
            <div className="flex flex-col gap-1 p-2 bg-primary/10/70 rounded-xl">
              <span className="text-xs font-semibold text-subtle uppercase">Nationality &amp; Identification</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-scene-content font-medium">{tenant.profile.nationality}</span>
                <span className="text-xs bg-accent px-2 py-0.5 rounded text-scene-content font-semibold">{tenant.profile.identityNumber}</span>
              </div>
            </div>
            <div className="flex flex-col gap-1 p-2 bg-primary/10/70 rounded-xl">
              <span className="text-xs font-semibold text-subtle uppercase">Date of Birth &amp; Gender</span>
              <span className="text-sm text-scene-content font-medium">{tenant.profile.birthGender}</span>
            </div>
            <div className="flex flex-col gap-1 p-2 bg-primary/10/70 rounded-xl">
              <span className="text-xs font-semibold text-subtle uppercase">Employment &amp; Occupation</span>
              <span className="text-sm text-scene-content font-medium">{tenant.profile.employment}</span>
            </div>
            <div className="md:col-span-2 flex flex-col gap-1 p-2 bg-primary/10/70 rounded-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-subtle uppercase">Emergency Contact</span>
                <span className="px-2 py-0.5 rounded-full bg-scene text-primary text-xs font-semibold">{tenant.profile.emergencyContact.relation}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <span className="text-sm text-scene-content font-semibold">{tenant.profile.emergencyContact.name}</span>
                <span className="text-xs font-normal text-subtle flex items-center gap-1">
                  <Icon name="call" className="text-sm" aria-hidden="true" />
                  {tenant.profile.emergencyContact.phone}
                </span>
                <span className="text-xs font-normal text-subtle flex items-center gap-1">
                  <Icon name="home" className="text-sm" aria-hidden="true" />
                  {tenant.profile.emergencyContact.location}
                </span>
              </div>
            </div>
            <div className="md:col-span-2 p-2 rounded-xl bg-[#fffbeb]/40 flex items-start gap-3">
              <Icon name="sticky_note_2" className="text-highlight text-[20px] mt-0.5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-highlight">Operator Notes &amp; Billing Preference</span>
                <p className="text-xs font-normal text-scene-content mt-0.5">{tenant.profile.notes}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex items-center justify-between pb-2 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="history_edu" className="text-primary-dark text-[22px]" aria-hidden="true" />
              <h2 className="text-lg text-scene-content font-semibold">Active Lease Agreement</h2>
            </div>
            <span className="text-xs bg-scene text-primary px-3 py-1 rounded-full font-semibold">{tenant.lease.contractNumber}</span>
          </div>
          <div className="bg-primary/10 rounded-xl p-4 mb-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-subtle uppercase">Monthly Base Rental</span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-semibold text-scene-content">{tenant.lease.monthlyRent}</span>
                  <span className="text-xs font-normal text-subtle">/ month</span>
                </div>
              </div>
              <div className="flex flex-col sm:items-end">
                <span className="text-xs font-semibold text-subtle uppercase">Payment Due Day</span>
                <div className="flex items-center gap-2 mt-1 text-lg font-semibold text-scene-content">
                  <Icon name="calendar_today" className="text-primary-dark text-[20px]" aria-hidden="true" />
                  <span>{tenant.lease.paymentDueDay}</span>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-normal mb-2">
                <span className="text-subtle">Contract Timeline ({tenant.lease.progressLabel})</span>
                <span className="font-semibold text-primary-dark">{Math.round(tenant.lease.progressPercent)}% Completed</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-accent overflow-hidden">
                <div className="h-full bg-primary-dark rounded-full transition-all duration-500" style={{ width: `${tenant.lease.progressPercent}%` }}></div>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold text-subtle mt-2">
                <span>Start: <strong className="text-scene-content">{tenant.lease.startDate}</strong></span>
                <span className="text-highlight font-semibold flex items-center gap-1">
                  <Icon name="schedule" className="text-sm" aria-hidden="true" />
                  Expires in {tenant.lease.expiresInDays} days
                </span>
                <span>End: <strong className="text-scene-content">{tenant.lease.endDate}</strong></span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
            <div className="p-2 bg-primary/10/50 rounded-lg flex flex-col">
              <span className="text-xs font-semibold text-subtle">Tenure Period</span>
              <span className="text-sm font-semibold text-scene-content">{tenant.lease.tenurePeriod}</span>
            </div>
            <div className="p-2 bg-primary/10/50 rounded-lg flex flex-col">
              <span className="text-xs font-semibold text-subtle">Utility Subsidy</span>
              <span className="text-sm font-semibold text-scene-content">{tenant.lease.utilitySubsidy}</span>
            </div>
            <div className="p-2 bg-primary/10/50 rounded-lg flex flex-col">
              <span className="text-xs font-semibold text-subtle">Renewal Status</span>
              <span className="text-sm font-semibold text-primary-dark">{tenant.lease.renewalStatus}</span>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button type="button" className="px-4 py-2 rounded-lg bg-[#e5eeff] hover:bg-[#dce9ff] text-scene-content text-xs font-semibold inline-flex items-center gap-2 transition-all">
              <Icon name="visibility" className="text-lg" aria-hidden="true" />
              <span>View Full Agreement PDF</span>
            </button>
            <button type="button" className="px-4 py-2 rounded-lg bg-scene text-primary hover:bg-indigo-100 text-xs font-semibold inline-flex items-center gap-2 transition-all">
              <Icon name="autorenew" className="text-lg" aria-hidden="true" />
              <span>{tenant.lease.renewalAction}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex items-center justify-between pb-2 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="receipt_long" className="text-primary-dark text-[22px]" aria-hidden="true" />
              <h2 className="text-lg text-scene-content font-semibold">Recent Invoices</h2>
            </div>
            <button type="button" className="text-primary-dark hover:text-[#2f2ebe] text-xs font-semibold">View All {tenant.overviewStats.billsCountLabel}</button>
          </div>
          <div className="flex flex-col gap-2">
            {tenant.recentInvoices.map((invoice) => {
              const statusClasses = getInvoiceStatusClasses(invoice.status);

              return (
                <div key={invoice.id} className="p-4 rounded-xl bg-primary/10 hover:bg-[#e5eeff] transition-colors flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-scene-content">{invoice.id}</span>
                      <span className={statusClasses.badge}>
                        <span className={statusClasses.dot}></span>
                        {invoice.status}
                      </span>
                    </div>
                    <span className={statusClasses.amount}>{invoice.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-normal text-subtle">
                    <span className="flex items-center gap-1">
                      <Icon name={statusClasses.metaIcon} className="text-sm" aria-hidden="true" />
                      {invoice.paidAt} ({invoice.method})
                    </span>
                    <button type="button" className="text-primary-dark hover:text-[#2f2ebe] text-xs font-semibold inline-flex items-center gap-1 p-1">
                      <Icon name="download" aria-hidden="true" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex items-center justify-between pb-2 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="timeline" className="text-primary-dark text-[22px]" aria-hidden="true" />
              <h2 className="text-lg text-scene-content font-semibold">Activity Timeline</h2>
            </div>
            <span className="text-xs font-semibold text-subtle">Audit Log</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#dce9ff]">
            {tenant.activityTimeline.map((item) => {
              const timelineClasses = getTimelineClasses(item.dotTone);

              return (
                <div key={`${item.title}-${item.at}`} className="relative">
                  <div className={timelineClasses.outer}>
                    <span className={timelineClasses.inner}></span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-scene-content">{item.title}</span>
                      <span className="text-xs font-semibold text-subtle">{item.at}</span>
                    </div>
                    <p className="text-xs font-normal text-subtle mt-0.5">{renderTimelineDescription(item)}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" className="w-full mt-4 py-2 rounded-lg bg-primary/10 hover:bg-[#e5eeff] text-subtle hover:text-scene-content text-xs font-semibold transition-colors flex items-center justify-center gap-1">
            <span>View Complete History</span>
            <Icon name="arrow_forward" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

function ContractPanel({ tenant }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-2 mb-4 border-b border-subtle">
            <div className="flex items-center gap-2">
              <Icon name="history_edu" className="text-primary-dark text-[22px]" aria-hidden="true" />
              <div>
                <h2 className="text-lg text-scene-content font-semibold">Contract Summary</h2>
                <p className="text-xs font-normal text-subtle mt-0.5">{tenant.lease.agreementSummary}</p>
              </div>
            </div>
            <span className="text-xs bg-scene text-primary px-3 py-1 rounded-full font-semibold">{tenant.lease.contractNumber}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Contract Period</span>
              <span className="text-sm text-scene-content font-semibold">{tenant.lease.startDate} - {tenant.lease.endDate}</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Property &amp; Unit</span>
              <span className="text-sm text-scene-content font-semibold">{tenant.residence.property} — {tenant.residence.unit}</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Monthly Rent</span>
              <span className="text-sm text-scene-content font-semibold">{tenant.lease.monthlyRent}</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Security Deposit</span>
              <span className="text-sm text-scene-content font-semibold">{tenant.lease.deposit}</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Payment Day</span>
              <span className="text-sm text-scene-content font-semibold">{tenant.lease.paymentDueDay}</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Late Fee</span>
              <span className="text-sm text-scene-content font-semibold">{tenant.lease.lateFee}</span>
            </div>
          </div>
        </div>

        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-subtle">
            <Icon name="gavel" className="text-primary-dark text-[22px]" aria-hidden="true" />
            <h2 className="text-lg text-scene-content font-semibold">Key Lease Clauses</h2>
          </div>
          <div className="flex flex-col gap-2">
            {tenant.lease.clauses.map((clause) => (
              <div key={clause} className="p-4 rounded-xl bg-primary/10/70 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary-dark flex-shrink-0">
                  <Icon name="check_circle" className="text-lg" aria-hidden="true" />
                </div>
                <p className="text-sm font-normal text-scene-content">{clause}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-subtle">
            <Icon name="calendar_month" className="text-primary-dark text-[22px]" aria-hidden="true" />
            <h2 className="text-lg text-scene-content font-semibold">Milestones</h2>
          </div>
          <div className="flex flex-col gap-2">
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Move-In Date</span>
              <span className="text-sm font-semibold text-scene-content">{tenant.residence.moveInDate}</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Renewal Status</span>
              <span className="text-sm font-semibold text-primary-dark">{tenant.lease.renewalStatus}</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Next Invoice Generation</span>
              <span className="text-sm font-semibold text-scene-content">{tenant.lease.nextInvoiceGeneration}</span>
            </div>
            <div className="p-4 rounded-xl bg-[#fffbeb]/40 flex items-start gap-3">
              <Icon name="schedule" className="text-highlight text-lg mt-0.5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-highlight">Expiry Watch</span>
                <p className="text-xs font-normal text-scene-content mt-0.5">This contract expires in {tenant.lease.expiresInDays} days. Prepare renewal paperwork and confirm rental fee strategy.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-subtle">
            <Icon name="description" className="text-primary-dark text-[22px]" aria-hidden="true" />
            <h2 className="text-lg text-scene-content font-semibold">Document Actions</h2>
          </div>
          <div className="flex flex-col gap-2">
            <button type="button" className="w-full px-4 py-2.5 rounded-xl bg-primary-dark text-primary-content hover:bg-primary text-xs font-semibold inline-flex items-center justify-center gap-2 shadow transition-all">
              <Icon name="download" className="text-lg" aria-hidden="true" />
              <span>Download Agreement</span>
            </button>
            <button type="button" className="w-full px-4 py-2 rounded-xl bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow">
              <Icon name="autorenew" className="text-lg" aria-hidden="true" />
              <span>{tenant.lease.renewalAction}</span>
            </button>
            <button type="button" className="w-full px-4 py-2 rounded-xl bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow">
              <Icon name="edit_document" className="text-lg" aria-hidden="true" />
              <span>Amend Contract Notes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BillsPanel({ tenant }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 bg-accent rounded-xl p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 mb-4 border-b border-subtle">
          <div className="flex items-center gap-2">
            <Icon name="receipt_long" className="text-primary-dark text-[22px]" aria-hidden="true" />
            <div>
              <h2 className="text-lg text-scene-content font-semibold">Billing Ledger</h2>
              <p className="text-xs font-normal text-subtle mt-0.5">Recurring rental fees and manually generated charges for this tenant.</p>
            </div>
          </div>
          <button type="button" className="px-4 py-2 rounded-xl bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow">
            <Icon name="add_card" className="text-lg" aria-hidden="true" />
            <span>Create Manual Bill</span>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {tenant.bills.map((bill) => (
            <div key={bill.id} className="p-4 rounded-xl bg-primary/10 hover:bg-[#e5eeff] transition-colors flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-scene-content">{bill.id}</span>
                  <span className={getBillStatusClasses(bill.status)}>{bill.status}</span>
                </div>
                <span className="text-lg font-semibold text-scene-content">{bill.amount}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-subtle uppercase">Billing Cycle</span>
                  <span className="text-sm text-scene-content font-medium">{bill.cycle}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-subtle uppercase">Due Date</span>
                  <span className="text-sm text-scene-content font-medium">{bill.dueDate}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-subtle uppercase">Category</span>
                  <span className="text-sm text-scene-content font-medium">{bill.category}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-normal text-subtle">
                <span>Generated {bill.generatedAt}</span>
                <button type="button" className="text-primary-dark hover:text-[#2f2ebe] text-xs font-semibold inline-flex items-center gap-1">
                  <Icon name="visibility" aria-hidden="true" />
                  <span>Inspect Bill</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-subtle">
            <Icon name="monitoring" className="text-primary-dark text-[22px]" aria-hidden="true" />
            <h2 className="text-lg text-scene-content font-semibold">Financial Snapshot</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Total Bills</span>
              <span className="text-sm text-scene-content font-semibold">{tenant.financialSummary.totalInvoiced}</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Total Paid</span>
              <span className="text-sm text-scene-content font-semibold">{tenant.financialSummary.totalPaid}</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Outstanding</span>
              <span className="text-sm text-scene-content font-semibold">{tenant.financialSummary.outstanding}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaymentsPanel({ tenant }) {
  const paymentTiming = tenant.financialSummary.averagePaymentDay.replace("Avg: ", "");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 bg-accent rounded-xl p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 mb-4 border-b border-subtle">
          <div className="flex items-center gap-2">
            <Icon name="paid" className="text-primary-dark text-[22px]" aria-hidden="true" />
            <div>
              <h2 className="text-lg text-scene-content font-semibold">Payment Records</h2>
              <p className="text-xs font-normal text-subtle mt-0.5">Recorded payments matched to bills for this tenant account.</p>
            </div>
          </div>
          <button type="button" className="px-4 py-2.5 rounded-xl bg-primary-dark text-primary-content hover:bg-primary text-xs font-semibold inline-flex items-center justify-center gap-2 shadow transition-all">
            <Icon name="payments" className="text-lg" aria-hidden="true" />
            <span>Record Payment</span>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {tenant.payments.map((payment) => (
            <div key={payment.id} className="p-4 rounded-xl bg-primary/10 hover:bg-[#e5eeff] transition-colors flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-scene-content">{payment.id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold">{payment.status}</span>
                </div>
                <span className="text-lg font-semibold text-scene-content">{payment.amount}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-subtle uppercase">Matched Invoice</span>
                  <span className="text-sm text-scene-content font-medium">{payment.invoiceId}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-subtle uppercase">Payment Method</span>
                  <span className="text-sm text-scene-content font-medium">{payment.method}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-subtle uppercase">Paid At</span>
                  <span className="text-sm text-scene-content font-medium">{payment.paidAt}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-subtle uppercase">Reference</span>
                  <span className="text-sm text-scene-content font-medium">{payment.reference}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-subtle">
            <Icon name="account_balance" className="text-primary-dark text-[22px]" aria-hidden="true" />
            <h2 className="text-lg text-scene-content font-semibold">Collection Notes</h2>
          </div>
          <div className="flex flex-col gap-2">
            <div className="p-4 rounded-xl bg-[#ecfdf5]/60 flex items-start gap-3">
              <Icon name="trending_up" className="text-success text-lg mt-0.5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-success">Collection Pattern</span>
                <p className="text-xs font-normal text-scene-content mt-0.5">{tenant.financialSummary.payerLabel}. Payments typically land around {paymentTiming}.</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Preferred Method</span>
              <span className="text-sm text-scene-content font-semibold">DuitNow Instant Bank Transfer</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Receipts</span>
              <span className="text-sm text-scene-content font-semibold">Share by email and WhatsApp after matching.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplaintsPanel({ tenant }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 bg-accent rounded-xl p-6 shadow">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-2 mb-4 border-b border-subtle">
          <div className="flex items-center gap-2">
            <Icon name="feedback" className="text-primary-dark text-[22px]" aria-hidden="true" />
            <div>
              <h2 className="text-lg text-scene-content font-semibold">Complaints &amp; Feedback</h2>
              <p className="text-xs font-normal text-subtle mt-0.5">Tenant-submitted issues, maintenance tickets, and resolution summaries.</p>
            </div>
          </div>
          <button type="button" className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#fff1f2] text-error hover:bg-red-100 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all">
            <Icon name="flag" className="text-lg" aria-hidden="true" />
            <span>Add Complaint</span>
          </button>
        </div>
        <div className="flex flex-col gap-2">
          {tenant.complaints.map((complaint) => (
            <div key={complaint.id} className="p-4 rounded-xl bg-primary/10 hover:bg-[#e5eeff] transition-colors flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-scene-content">{complaint.id}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-xs font-semibold">{complaint.category}</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold">{complaint.status}</span>
                </div>
                <span className="text-xs font-semibold text-subtle">Priority: {complaint.priority}</span>
              </div>
              <div>
                <h3 className="text-lg text-scene-content font-semibold">{complaint.title}</h3>
                <p className="text-xs font-normal text-subtle mt-1">{complaint.summary}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <div className="p-2 rounded-lg bg-accent flex flex-col gap-1">
                  <span className="text-xs font-semibold text-subtle uppercase">Opened</span>
                  <span className="text-sm text-scene-content font-medium">{complaint.openedAt}</span>
                </div>
                <div className="p-2 rounded-lg bg-accent flex flex-col gap-1">
                  <span className="text-xs font-semibold text-subtle uppercase">Resolved</span>
                  <span className="text-sm text-scene-content font-medium">{complaint.resolvedAt}</span>
                </div>
              </div>
              <div className="p-2 rounded-lg bg-[#ecfdf5]/60 flex items-start gap-3">
                <Icon name="build_circle" className="text-success text-lg mt-0.5" aria-hidden="true" />
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-success">Resolution</span>
                  <p className="text-xs font-normal text-scene-content mt-0.5">{complaint.resolution}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-4 flex flex-col gap-6">
        <div className="bg-accent rounded-xl p-6 shadow">
          <div className="flex items-center gap-2 pb-2 mb-4 border-b border-subtle">
            <Icon name="rule_settings" className="text-primary-dark text-[22px]" aria-hidden="true" />
            <h2 className="text-lg text-scene-content font-semibold">Service Notes</h2>
          </div>
          <div className="flex flex-col gap-2">
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Preferred Contact Channel</span>
              <span className="text-sm text-scene-content font-semibold">WhatsApp first, then email fallback.</span>
            </div>
            <div className="p-4 rounded-xl bg-primary/10/70 flex flex-col gap-1">
              <span className="text-xs font-semibold text-subtle uppercase">Resolution SLA</span>
              <span className="text-sm text-scene-content font-semibold">Routine maintenance within 48 business hours.</span>
            </div>
            <div className="p-4 rounded-xl bg-[#fffbeb]/40 flex items-start gap-3">
              <Icon name="campaign" className="text-highlight text-lg mt-0.5" aria-hidden="true" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-highlight">Operator Reminder</span>
                <p className="text-xs font-normal text-scene-content mt-0.5">Log all complaint updates under the tenant timeline so future managers can see the full service context.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TenantTabs({ activeTab, onTabChange, tenant }) {
  return (
    <div className="bg-accent rounded-xl px-4 py-2 shadow flex items-center overflow-x-auto gap-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;

        return (
          <button
            key={tab.key}
            type="button"
            className={isActive
              ? "px-4 py-2 rounded-lg text-xs bg-primary-dark text-primary-content font-semibold flex items-center gap-2 shadow whitespace-nowrap"
              : "px-4 py-2 rounded-lg text-xs font-semibold text-subtle hover:text-scene-content hover:bg-primary/10 transition-colors flex items-center gap-2 whitespace-nowrap"}
            onClick={() => onTabChange(tab.key)}
          >
            <Icon name={tab.icon} className="text-lg" aria-hidden="true" />
            <span>{tab.label}</span>
            {tab.getBadgeLabel ? <span className={tab.badgeClassName}>{tab.getBadgeLabel(tenant)}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

function TenantHeader({ tenant }) {
  const outstandingStyles = getOutstandingStyles(tenant.financialSummary.outstanding);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 text-subtle text-xs font-semibold">
          <Link className="hover:text-primary-dark transition-colors flex items-center gap-1" href="/tenants">
            <Icon name="group" aria-hidden="true" />
            <span>Tenants</span>
          </Link>
          <Icon name="chevron_right" className="text-sm" aria-hidden="true" />
          <span className="text-scene-content font-semibold">{tenant.name} ({tenant.preferredName})</span>
          <span className="ml-2 px-2.5 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold inline-flex items-center gap-2 shadow">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            {tenant.statusLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-subtle text-xs font-normal hidden sm:inline">Tenant ID:</span>
          <span className="text-xs bg-[#e5eeff] px-2.5 py-1 rounded-lg text-primary-dark font-semibold">{tenant.tenantCode}</span>
          <button type="button" className="p-2 rounded-xl bg-accent text-subtle hover:text-primary-dark hover:bg-primary/10 shadow transition-all" title="Share Profile">
            <Icon name="share" className="text-lg" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="relative bg-accent rounded-xl p-6 shadow border-default overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-5 flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-[color:color-mix(in_srgb,var(--primary-dark)_5%,transparent)] text-primary-dark flex items-center justify-center text-3xl font-semibold ring-4 ring-primary/10 shadow">
                {tenant.initials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#ecfdf5] text-success flex items-center justify-center ring-2 ring-accent shadow" title="Active Resident">
                <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse"></span>
              </span>
            </div>
            <div className="flex flex-col gap-2 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl text-scene-content font-semibold">{tenant.name}</h1>
                <span className="text-xs text-subtle bg-primary/10 px-2 py-0.5 rounded-md font-medium">Preferred: {tenant.preferredName}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-0.5">
                <span className="text-xs text-success bg-[#ecfdf5] px-2.5 py-0.5 rounded-full font-medium inline-flex items-center gap-2 shadow">
                  <Icon name="verified" className="text-sm" aria-hidden="true" />
                  IC: {tenant.profile.identityNumber} ({tenant.profile.identityStatus})
                </span>
              </div>
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-primary/10 text-primary-dark mt-1">
                <Icon name="apartment" className="text-lg text-primary-dark" aria-hidden="true" />
                <span className="text-xs font-semibold text-scene-content truncate">{tenant.residence.property}</span>
                <span className="text-subtle text-xs font-normal truncate">— {tenant.residence.unit} ({tenant.residence.roomLabel})</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col gap-2.5 border-t lg:border-t-0 lg:border-l border-subtle pt-4 lg:pt-0 lg:pl-6">
            <div className="flex items-center justify-between group p-2 rounded-lg hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-subtle group-hover:text-primary-dark transition-colors">
                  <Icon name="call" className="text-lg" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-subtle uppercase">Phone</span>
                  <a href={`tel:${tenant.contact.phone.replace(/\s+/g, "")}`} className="text-sm font-semibold text-scene-content hover:text-primary-dark transition-colors">{tenant.contact.phone}</a>
                </div>
              </div>
              <button type="button" className="p-1 text-subtle hover:text-scene-content rounded hover:bg-accent transition-colors" title="Copy Phone">
                <Icon name="content_copy" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center justify-between group p-2 rounded-lg hover:bg-primary/10 transition-colors">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-subtle group-hover:text-primary-dark transition-colors">
                  <Icon name="mail" className="text-lg" aria-hidden="true" />
                </div>
                <div className="flex flex-col truncate">
                  <span className="text-xs font-semibold text-subtle uppercase">Email</span>
                  <a href={`mailto:${tenant.contact.email}`} className="text-sm font-semibold text-scene-content hover:text-primary-dark transition-colors truncate">{tenant.contact.email}</a>
                </div>
              </div>
              <button type="button" className="p-1 text-subtle hover:text-scene-content rounded hover:bg-accent transition-colors" title="Copy Email">
                <Icon name="content_copy" aria-hidden="true" />
              </button>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-subtle">
                  <Icon name="date_range" className="text-lg" aria-hidden="true" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-subtle uppercase">Lease Period</span>
                  <span className="text-sm font-semibold text-scene-content">{tenant.lease.period}</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold">{tenant.lease.status}</span>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-2 justify-center border-t lg:border-t-0 lg:border-l border-subtle pt-4 lg:pt-0 lg:pl-6">
            <button type="button" className="w-full px-4 py-2.5 rounded-xl bg-primary-dark text-primary-content hover:bg-primary text-xs font-semibold inline-flex items-center justify-center gap-2 shadow transition-all">
              <Icon name="payments" className="text-lg" aria-hidden="true" />
              <span>Record Payment</span>
            </button>
            <button type="button" className="w-full px-4 py-2 rounded-xl bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow">
              <Icon name="receipt" className="text-lg" aria-hidden="true" />
              <span>Create Bill</span>
            </button>
            <button type="button" className="w-full px-4 py-2 rounded-xl bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all shadow">
              <Icon name="edit" className="text-lg" aria-hidden="true" />
              <span>Edit Profile</span>
            </button>
            <button type="button" className="w-full px-4 py-2 rounded-xl bg-[#fff1f2] text-error hover:bg-red-100 text-xs font-semibold inline-flex items-center justify-center gap-2 transition-all">
              <Icon name="flag" className="text-lg" aria-hidden="true" />
              <span>Add Complaint</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-accent rounded-xl p-4 shadow flex flex-col justify-between hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-subtle mb-2">
            <span className="text-xs uppercase font-semibold">Total Invoiced</span>
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary-dark">
              <Icon name="request_quote" className="text-lg" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-scene-content font-semibold">{tenant.financialSummary.totalInvoiced}</span>
          </div>
          <div className="flex items-center justify-between text-subtle text-xs font-normal mt-3 pt-2 bg-[#ffffff]">
            <span className="text-subtle">{tenant.financialSummary.cumulativeBillingCycles}</span>
            <span className="text-xs text-primary-dark font-semibold">{tenant.financialSummary.billRate}</span>
          </div>
        </div>

        <div className="bg-accent rounded-xl p-4 shadow flex flex-col justify-between hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-subtle mb-2">
            <span className="text-xs uppercase font-semibold">Total Paid</span>
            <div className="w-8 h-8 rounded-lg bg-[#ecfdf5] flex items-center justify-center text-success">
              <Icon name="check_circle" className="text-lg" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-scene-content font-semibold">{tenant.financialSummary.totalPaid}</span>
          </div>
          <div className="flex items-center justify-between text-subtle text-xs font-normal mt-3 pt-2 bg-[#ffffff]">
            <span className="text-success font-semibold flex items-center gap-1">
              <Icon name="trending_up" className="text-sm" aria-hidden="true" />
              {tenant.financialSummary.payerLabel}
            </span>
            <span className="text-subtle text-xs font-semibold">{tenant.financialSummary.averagePaymentDay}</span>
          </div>
        </div>

        <div className="bg-accent rounded-xl p-4 shadow flex flex-col justify-between relative overflow-hidden hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-subtle mb-2">
            <span className="text-xs uppercase font-semibold">Current Outstanding</span>
            <div className={outstandingStyles.iconWrap}>
              <Icon name={outstandingStyles.icon} className="text-lg" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={outstandingStyles.amount}>{tenant.financialSummary.outstanding}</span>
            <span className={outstandingStyles.badge}>{tenant.financialSummary.outstandingHealth}</span>
          </div>
          <div className="flex items-center justify-between text-subtle text-xs font-normal mt-3 pt-2">
            <span className="text-subtle">Next invoice generation:</span>
            <span className="text-xs text-scene-content font-semibold">{tenant.lease.nextInvoiceGeneration}</span>
          </div>
        </div>

        <div className="bg-accent rounded-xl p-4 shadow flex flex-col justify-between hover:shadow transition-shadow">
          <div className="flex items-center justify-between text-subtle mb-2">
            <span className="text-xs uppercase font-semibold">Security Deposit Held</span>
            <div className="w-8 h-8 rounded-lg bg-[#e2dfff] flex items-center justify-center text-primary-dark">
              <Icon name="lock" className="text-lg" aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl text-scene-content font-semibold">{tenant.financialSummary.securityDepositHeld}</span>
            <span className="text-xs text-subtle font-medium">{tenant.financialSummary.securityDepositMonths}</span>
          </div>
          <div className="flex items-center justify-between text-subtle text-xs font-normal mt-3 pt-2">
            <span className="text-subtle">In Custody / Escrow</span>
            <span className="text-primary-dark font-semibold text-xs flex items-center gap-1">
              <Icon name="verified_user" className="text-xs" aria-hidden="true" />
              {tenant.financialSummary.depositStatus}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

function TenantTabPanel({ activeTab, tenant }) {
  if (activeTab === "contract") {
    return <ContractPanel tenant={tenant} />;
  }

  if (activeTab === "bills") {
    return <BillsPanel tenant={tenant} />;
  }

  if (activeTab === "payments") {
    return <PaymentsPanel tenant={tenant} />;
  }

  if (activeTab === "complaints") {
    return <ComplaintsPanel tenant={tenant} />;
  }

  return <OverviewPanel tenant={tenant} />;
}

export default function TenantDetailPage({ params }) {
  const { id } = use(params);
  const tenant = getTenantDetail(id);
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <main className="flex flex-col w-full">
      <div className="p-8 flex flex-col gap-6">
        <TenantHeader tenant={tenant} />
        <TenantTabs activeTab={activeTab} onTabChange={setActiveTab} tenant={tenant} />
        <TenantTabPanel activeTab={activeTab} tenant={tenant} />
      </div>
    </main>
  );
}
