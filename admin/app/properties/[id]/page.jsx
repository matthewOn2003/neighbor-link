"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Icon } from "@/components/ui";
import { getPropertyDetail } from "@/mock/propertyDetail";

const tabs = [
  { key: "overview", label: "Overview" },
  { key: "contract", label: "Contract" },
  { key: "bills", label: "Bills" },
  { key: "payments", label: "Payments" },
  { key: "complaints", label: "Complaints" },
];

const moreActions = [
  { icon: "print", label: "Print Statement" },
  { icon: "qr_code_2", label: "Access QR Code" },
  { icon: "archive", label: "Archive Unit", danger: true },
];

function copyToClipboard(value) {
  if (typeof navigator === "undefined" || !navigator.clipboard) {
    return;
  }

  navigator.clipboard.writeText(value).catch(() => { });
}

function StatCard({ title, icon, iconWrapperClassName, children }) {
  return (
    <div className="bg-accent rounded-xl p-4 shadow flex flex-col justify-between relative overflow-hidden group hover:shadow transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase text-subtle">
          {title}
        </span>
        <div className={iconWrapperClassName}>
          <Icon name={icon} className="text-lg" />
        </div>
      </div>
      {children}
    </div>
  );
}

function SectionTabs({ activeTab, setActiveTab }) {
  return (
    <div className="px-8 pb-6">
      <div className="inline-flex flex-wrap gap-1 rounded-xl bg-accent p-1 shadow">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-all ${activeTab === tab.key
              ? "bg-primary-dark text-primary-content shadow"
              : "bg-transparent text-subtle hover:bg-primary/10 hover:text-scene-content"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function PropertySpecificationsCard({ detail }) {
  return (
    <div className="bg-accent rounded-xl shadow overflow-hidden">
      <div className="relative w-full h-52 bg-primary/10 overflow-hidden group">
        <img
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          src={detail.image}
          alt={detail.imageTitle}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#213145]/80 via-[#213145]/20 to-transparent flex items-end p-4">
          <div className="flex items-center justify-between w-full text-[#ffffff]">
            <div>
              <span className="text-xs font-semibold uppercase bg-[color:color-mix(in_srgb,var(--primary-dark)_80%,transparent)] backdrop-blur-md px-2.5 py-0.5 rounded-full">
                {detail.imageLabel}
              </span>
              <p className="text-lg font-semibold mt-1">
                {detail.imageTitle}
              </p>
            </div>
            <button
              type="button"
              className="bg-[color:color-mix(in_srgb,var(--accent)_90%,transparent)] hover:bg-accent backdrop-blur-md text-scene-content text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-2 shadow transition-all"
            >
              <Icon name="photo_library" />
              <span className="">View All ({detail.galleryCount})</span>
            </button>
          </div>
        </div>
      </div>
      <div className="p-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="apartment" className="text-primary-dark text-[22px]" />
            <h2 className="text-lg text-scene-content font-semibold">
              Property Specifications
            </h2>
          </div>
          <span className="text-xs font-medium text-subtle bg-primary/10 px-2.5 py-1 rounded-md">
            {detail.unitMetaBadge}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {detail.specs.map((spec) => (
            <div
              key={spec.label}
              className="p-4 rounded-xl bg-primary/10 flex flex-col gap-1"
            >
              <span className="text-xs font-semibold text-subtle">{spec.label}</span>
              <span className="text-lg text-scene-content font-semibold">
                {spec.value}
                {spec.suffix ? (
                  <span className="text-sm font-normal text-subtle">
                    {" "}
                    {spec.suffix}
                  </span>
                ) : null}
              </span>
              <span className="text-xs font-normal text-subtle">{spec.subtext}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-scene-content font-semibold">
              Allocated Parking
            </span>
            <span className="text-xs font-semibold text-primary-dark bg-[#e2dfff] px-2.5 py-1 rounded-md">
              {detail.parkingLabel}
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            <span className="text-xs font-semibold text-subtle uppercase">
              Furnished Unit Amenities
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {detail.amenities.map((amenity) => (
                <div
                  key={amenity.title}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#ffffff] shadow"
                >
                  <div className="w-7 h-7 rounded-md bg-scene text-primary-dark flex items-center justify-center">
                    <Icon name={amenity.icon} className="text-lg" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-scene-content font-medium">
                      {amenity.title}
                    </span>
                    <span className="text-xs font-normal text-subtle text-xs">
                      {amenity.detail}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CurrentContractCard({ detail }) {
  return (
    <div className="bg-accent rounded-xl p-6 shadow flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="badge" className="text-primary-dark text-[22px]" />
          <h2 className="text-lg text-scene-content font-semibold">
            Current Contract &amp; Tenant
          </h2>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs text-primary-dark hover:text-primary font-semibold transition-colors"
        >
          <span className="">View Full Contract</span>
          <Icon name="arrow_forward" />
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-xl bg-primary/10">
        <div className="md:col-span-6 flex items-center gap-4">
          <div className="relative">
            <img
              className="w-14 h-14 rounded-full object-cover shadow"
              src={detail.tenant.avatar}
              alt={detail.tenant.name}
            />
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-success ring-2 ring-accent"></span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-lg text-scene-content font-semibold truncate">
                {detail.tenant.name}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold">
                {detail.tenant.badge}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-subtle text-xs font-normal">
              <Icon name="call" className="text-sm" />
              <span className="text-xs text-scene-content font-medium">
                {detail.tenant.phone}
              </span>
            </div>
            <div className="flex items-center gap-2 text-subtle text-xs font-normal">
              <Icon name="mail" className="text-sm" />
              <span className="truncate">{detail.tenant.email}</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-6 grid grid-cols-2 gap-2 pl-0 md:pl-4 md:border-l md:border-[color:color-mix(in_srgb,var(--line)_50%,transparent)]">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-subtle">Lease Duration</span>
            <span className="text-xs text-scene-content font-semibold mt-0.5">
              {detail.contract.leaseDuration}
            </span>
            <span className="text-xs text-primary mt-0.5 font-medium">
              {detail.contract.leaseMeta}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-subtle">
              Security Deposit Held
            </span>
            <span className="text-[20px] text-scene-content font-semibold mt-0.5">
              RM {detail.contract.deposit}
            </span>
            <span className="text-xs font-normal text-success flex items-center gap-1 mt-0.5">
              <Icon name="shield" className="text-sm" />
              <span className="">{detail.contract.depositLabel}</span>
            </span>
          </div>
        </div>
      </div>

      <div className="p-2 rounded-lg bg-[#ffffff] flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-normal">
          <span className="text-subtle">{detail.contract.progressLabel}</span>
          <span className="text-xs text-scene-content font-semibold">
            {detail.contract.progressValue}
          </span>
        </div>
        <div className="w-full bg-[#dce9ff] rounded-full h-2 overflow-hidden flex">
          <div
            className="bg-primary-dark h-full rounded-full transition-all duration-500"
            style={{ width: detail.contract.progressWidth }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-subtle">
          <span className="">{detail.contract.moveIn}</span>
          <span className="text-highlight font-semibold flex items-center gap-1">
            <Icon name="alarm" className="text-xs" />
            {detail.contract.renewalNotice}
          </span>
          <span className="">{detail.contract.expiry}</span>
        </div>
      </div>
    </div>
  );
}

function BillingHistoryCard({ bills, title = "Billing & Payment History" }) {
  return (
    <div className="bg-accent rounded-xl p-6 shadow flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="history_edu" className="text-primary-dark text-[22px]" />
          <h2 className="text-lg text-scene-content font-semibold">{title}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-subtle bg-primary/10 px-2.5 py-1 rounded-md">
            Showing Recent 3 Cycles
          </span>
          <button
            type="button"
            className="text-xs text-primary-dark hover:text-primary font-semibold"
          >
            View All
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-primary/10 text-subtle text-xs font-semibold uppercase rounded-lg">
              <th className="py-2.5 px-4 rounded-l-lg">Invoice ID</th>
              <th className="py-2.5 px-4">Billing Period</th>
              <th className="py-2.5 px-4">Due Date</th>
              <th className="py-2.5 px-4">Amount</th>
              <th className="py-2.5 px-4">Status</th>
              <th className="py-2.5 px-4 text-right rounded-r-lg">Receipt</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f1f5f9] text-xs font-normal">
            {bills.map((bill) => (
              <tr key={bill.invoiceId} className="hover:bg-primary/10/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <Icon name="receipt" className="text-primary-dark" />
                    <span className="text-xs font-semibold text-scene-content">
                      {bill.invoiceId}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-scene-content font-medium">{bill.period}</td>
                <td className="py-3 px-4 text-subtle">{bill.dueDate}</td>
                <td className="py-3 px-4 text-xs font-semibold text-scene-content">
                  RM {bill.amount}
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold">
                    <span className="w-2 h-2 rounded-full bg-success"></span>
                    {bill.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary-dark hover:text-primary bg-primary/10 px-2 py-1 rounded-md transition-colors"
                  >
                    <Icon name="download" className="text-sm" />
                    <span className="">{bill.receiptId}</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WifiCard({ detail, passwordVisible, setPasswordVisible }) {
  return (
    <div className="bg-accent rounded-xl p-6 shadow flex flex-col gap-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-scene text-primary-dark flex items-center justify-center">
            <Icon name="wifi" className="text-[20px]" />
          </div>
          <h3 className="text-lg text-scene-content font-semibold">
            WiFi Credentials
          </h3>
        </div>
        <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
          {detail.wifi.status}
        </span>
      </div>
      <div className="bg-primary/10 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-subtle">Network SSID (5GHz)</span>
            <span className="text-xs font-semibold text-scene-content mt-0.5">
              {detail.wifi.networkName}
            </span>
          </div>
          <button
            type="button"
            onClick={() => copyToClipboard(detail.wifi.networkName)}
            className="p-2 rounded-lg bg-accent text-subtle hover:text-primary-dark transition-colors"
            title="Copy SSID"
          >
            <Icon name="content_copy" className="text-lg" />
          </button>
        </div>
        <div className="h-px bg-[color:color-mix(in_srgb,var(--line)_60%,transparent)] w-full"></div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-subtle">WPA3 Password</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-semibold text-scene-content">
                {passwordVisible ? detail.wifi.password : detail.wifi.maskedPassword}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPasswordVisible((current) => !current)}
              className="p-2 rounded-lg bg-accent text-subtle hover:text-scene-content transition-colors"
              title="Toggle password visibility"
            >
              <Icon
                name={passwordVisible ? "visibility_off" : "visibility"}
                className="text-lg"
              />
            </button>
            <button
              type="button"
              onClick={() => copyToClipboard(detail.wifi.password)}
              className="p-2 rounded-lg bg-accent text-subtle hover:text-primary-dark transition-colors"
              title="Copy Password"
            >
              <Icon name="content_copy" className="text-lg" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs font-normal">
        <div className="p-2.5 rounded-lg bg-[#ffffff]">
          <span className="text-xs font-semibold text-subtle block">Router Hardware</span>
          <span className="text-xs text-scene-content font-semibold">
            {detail.wifi.routerHardware}
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-[#ffffff]">
          <span className="text-xs font-semibold text-subtle block">Bandwidth Tier</span>
          <span className="text-xs text-scene-content font-semibold">
            {detail.wifi.bandwidthTier}
          </span>
        </div>
      </div>
    </div>
  );
}

function ComplaintsCard({ detail }) {
  return (
    <div className="bg-accent rounded-xl p-6 shadow flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary-dark flex items-center justify-center">
            <Icon name="build_circle" className="text-[20px]" />
          </div>
          <h3 className="text-lg text-scene-content font-semibold">
            Complaints &amp; Maintenance
          </h3>
        </div>
        <span className="w-5 h-5 rounded-full bg-primary/10 text-subtle text-xs flex items-center justify-center font-semibold">
          {detail.complaints.length}
        </span>
      </div>

      {detail.complaints.map((complaint) => (
        <div
          key={complaint.id}
          className="p-4 rounded-xl bg-primary/10 flex flex-col gap-2 relative border-l-4 border-success"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-subtle font-mono">
              {complaint.id}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold">
              <Icon name="check" className="text-sm" />
              {complaint.status}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-scene-content font-semibold">
              {complaint.title}
            </span>
            <p className="text-xs font-normal text-subtle mt-0.5">
              {complaint.description}
            </p>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-[color:color-mix(in_srgb,var(--line)_40%,transparent)] text-xs text-subtle">
            <span className="">{complaint.reporter}</span>
            <span className="text-success font-medium">{complaint.turnaround}</span>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="w-full py-2 px-3 rounded-lg bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
      >
        <Icon name="add" className="text-lg" />
        <span className="">Log Maintenance Ticket</span>
      </button>
    </div>
  );
}

function NotesCard({ detail }) {
  return (
    <div className="bg-accent rounded-xl p-6 shadow flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary-dark flex items-center justify-center">
            <Icon name="key" className="text-[20px]" />
          </div>
          <h3 className="text-lg text-scene-content font-semibold">
            Notes &amp; Access Keys
          </h3>
        </div>
        <Icon name="vpn_key" className="text-subtle" />
      </div>

      <div className="p-4 rounded-xl bg-scene flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-primary font-semibold uppercase">
            Master Smart Lock PIN
          </span>
          <Icon name="pin" className="text-primary" />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-lg font-mono font-semibold text-scene-content bg-accent px-3 py-1 rounded-lg shadow">
            {detail.access.smartLockPin}
          </span>
          <button
            type="button"
            onClick={() => copyToClipboard(detail.access.pinCopyValue)}
            className="text-xs text-primary-dark hover:text-primary font-semibold px-2 py-1 rounded bg-accent transition-colors"
          >
            Copy PIN
          </button>
        </div>
        <span className="text-xs text-primary/80">
          {detail.access.pinNotice}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-subtle uppercase">
          Physical Handover Log
        </span>
        <div className="flex flex-col gap-2">
          {detail.access.handoverItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between p-2 rounded-lg bg-primary/10 text-xs font-normal"
            >
              <div className="flex items-center gap-2">
                <Icon name={item.icon} className="text-subtle" />
                <span className="text-scene-content font-medium">{item.label}</span>
              </div>
              <span className="text-xs font-medium text-subtle">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-2.5 rounded-lg bg-[#fffbeb] text-highlight flex items-start gap-2">
        <Icon name="info" className="text-lg shrink-0 mt-0.5" />
        <p className="text-xs">
          <strong className="font-semibold">Operator Note:</strong> {detail.access.operatorNote}
        </p>
      </div>
    </div>
  );
}

function OverviewPanel({ detail, passwordVisible, setPasswordVisible }) {
  return (
    <>
      <div className="lg:col-span-8 flex flex-col gap-6">
        <PropertySpecificationsCard detail={detail} />
        <CurrentContractCard detail={detail} />
        <BillingHistoryCard bills={detail.bills} />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <WifiCard
          detail={detail}
          passwordVisible={passwordVisible}
          setPasswordVisible={setPasswordVisible}
        />
        <ComplaintsCard detail={detail} />
        <NotesCard detail={detail} />
      </div>
    </>
  );
}

function ContractPanel({ detail, passwordVisible, setPasswordVisible }) {
  return (
    <>
      <div className="lg:col-span-8 flex flex-col gap-6">
        <PropertySpecificationsCard detail={detail} />
        <CurrentContractCard detail={detail} />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <WifiCard
          detail={detail}
          passwordVisible={passwordVisible}
          setPasswordVisible={setPasswordVisible}
        />
        <NotesCard detail={detail} />
      </div>
    </>
  );
}

function BillsPanel({ detail }) {
  return (
    <>
      <div className="lg:col-span-8 flex flex-col gap-6">
        <BillingHistoryCard bills={detail.bills} title="Billing History" />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <ComplaintsCard detail={detail} />
      </div>
    </>
  );
}

function PaymentsPanel({ detail }) {
  return (
    <>
      <div className="lg:col-span-8 flex flex-col gap-6">
        <BillingHistoryCard bills={detail.bills} title="Payment History" />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <NotesCard detail={detail} />
      </div>
    </>
  );
}

function ComplaintsPanel({ detail, passwordVisible, setPasswordVisible }) {
  return (
    <>
      <div className="lg:col-span-8 flex flex-col gap-6">
        <ComplaintsCard detail={detail} />
        <NotesCard detail={detail} />
      </div>
      <div className="lg:col-span-4 flex flex-col gap-6">
        <WifiCard
          detail={detail}
          passwordVisible={passwordVisible}
          setPasswordVisible={setPasswordVisible}
        />
      </div>
    </>
  );
}

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const detail = useMemo(() => getPropertyDetail(propertyId), [propertyId]);
  const [activeTab, setActiveTab] = useState("overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <div className="flex flex-col w-full">
      <div className="absolute top-16 right-12 w-96 h-96 bg-[color:color-mix(in_srgb,var(--primary-dark)_5%,transparent)] rounded-full blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute top-48 left-1/3 w-72 h-72 bg-[#6063ee]/5 rounded-full blur-2xl pointer-events-none -z-10"></div>

      <div className="px-8 pt-6 pb-2 flex items-center justify-between">
        <nav className="flex items-center gap-2 text-xs font-semibold text-subtle">
          <Link href="/properties" className="hover:text-primary-dark transition-colors flex items-center gap-1">
            <Icon name="domain" />
            <span className="">Properties</span>
          </Link>
          <span className="text-[color:color-mix(in_srgb,var(--subtle)_40%,transparent)]">/</span>
          <span className="hover:text-primary-dark transition-colors">{detail.propertyName}</span>
          <span className="text-[color:color-mix(in_srgb,var(--subtle)_40%,transparent)]">/</span>
          <span className="text-scene-content font-semibold">Unit {detail.unitNumber}</span>
        </nav>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            {detail.telemetryStatus}
          </span>
          <span className="text-xs font-medium text-subtle px-2 py-1 bg-primary/10 rounded-lg">
            ID: {detail.propertyCode}
          </span>
        </div>
      </div>

      <div className="px-8 pb-6">
        <div className="bg-accent rounded-xl p-6 shadow flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-scene-content">
                {detail.title}
              </h1>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-scene text-primary text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                {detail.occupancyStatus}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-subtle text-xs font-semibold">
                <Icon name="home_work" className="text-sm" />
                {detail.propertyType}
              </span>
            </div>
            <p className="text-sm font-normal text-subtle flex items-center gap-2">
              <Icon name="location_on" className="text-lg text-primary-dark" />
              <span className="">{detail.address}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold transition-all"
            >
              <Icon name="edit" className="text-lg" />
              <span className="">Edit Property</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold transition-all"
            >
              <Icon name="receipt_long" className="text-lg" />
              <span className="">Create Bill</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-dark hover:bg-primary text-primary-content text-xs font-semibold shadow transition-all"
            >
              <Icon name="add_circle" className="text-lg" />
              <span className="">Create Contract</span>
            </button>
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((current) => !current)}
                className="p-2 rounded-lg bg-primary/10 hover:bg-[#e5eeff] text-subtle hover:text-scene-content transition-colors"
              >
                <Icon name="more_vert" className="text-[20px]" />
              </button>
              <div
                className="hidden absolute right-0 mt-2 w-48 bg-accent rounded-xl shadow p-2 z-30"
                style={{ display: menuOpen ? "block" : undefined }}
              >
                {moreActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => setMenuOpen(false)}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-normal hover:bg-primary/10 rounded-lg transition-colors ${action.danger
                      ? "text-error hover:bg-[#fff1f2]"
                      : "text-scene-content"
                      }`}
                  >
                    <Icon name={action.icon} />
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 pb-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Rent"
          icon="real_estate_agent"
          iconWrapperClassName="w-8 h-8 rounded-lg bg-primary/10 text-primary-dark flex items-center justify-center"
        >
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-subtle font-medium">RM</span>
              <span className="text-2xl font-semibold text-scene-content">
                {detail.monthlyRent}
              </span>
              <span className="text-xs font-normal text-subtle">/ mo</span>
            </div>
            <p className="text-xs text-success flex items-center gap-1 mt-1 font-medium">
              <Icon name="verified" className="text-sm" />
              <span className="">{detail.rentNote}</span>
            </p>
          </div>
        </StatCard>

        <StatCard
          title="Current Outstanding"
          icon="check_circle"
          iconWrapperClassName="w-8 h-8 rounded-lg bg-[#ecfdf5] text-success flex items-center justify-center"
        >
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-subtle font-medium">RM</span>
              <span className="text-2xl font-semibold text-scene-content">
                {detail.currentOutstanding}
              </span>
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-xs text-success bg-[#ecfdf5] px-2 py-0.5 rounded-md font-semibold">
              <span className="">{detail.outstandingLabel}</span>
            </div>
          </div>
        </StatCard>

        <StatCard
          title="Total Paid YTD"
          icon="account_balance"
          iconWrapperClassName="w-8 h-8 rounded-lg bg-[#e2dfff] text-primary-dark flex items-center justify-center"
        >
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-xs text-subtle font-medium">RM</span>
              <span className="text-2xl font-semibold text-scene-content">
                {detail.totalPaidYtd}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              <div className="w-full bg-primary/10 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary-dark h-full rounded-full"
                  style={{ width: detail.totalPaidProgressWidth }}
                ></div>
              </div>
              <span className="text-xs font-semibold text-subtle font-mono">
                {detail.totalPaidProgressLabel}
              </span>
            </div>
          </div>
        </StatCard>

        <StatCard
          title="Next Due Date"
          icon="calendar_month"
          iconWrapperClassName="w-8 h-8 rounded-lg bg-[#fffbeb] text-highlight flex items-center justify-center"
        >
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-scene-content">
                {detail.nextDueDate}
              </span>
            </div>
            <p className="text-xs font-normal text-subtle flex items-center gap-2 mt-1 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-[#6063ee]"></span>
              <span className="">{detail.nextDueLabel}</span>
            </p>
          </div>
        </StatCard>
      </div>

      <SectionTabs activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="px-8 pb-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {activeTab === "overview" ? (
          <OverviewPanel
            detail={detail}
            passwordVisible={passwordVisible}
            setPasswordVisible={setPasswordVisible}
          />
        ) : null}
        {activeTab === "contract" ? (
          <ContractPanel
            detail={detail}
            passwordVisible={passwordVisible}
            setPasswordVisible={setPasswordVisible}
          />
        ) : null}
        {activeTab === "bills" ? <BillsPanel detail={detail} /> : null}
        {activeTab === "payments" ? <PaymentsPanel detail={detail} /> : null}
        {activeTab === "complaints" ? (
          <ComplaintsPanel
            detail={detail}
            passwordVisible={passwordVisible}
            setPasswordVisible={setPasswordVisible}
          />
        ) : null}
      </div>
    </div>
  );
}
