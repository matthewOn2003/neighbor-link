"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { DataTable } from "@/components/ui/DataTable";
import { useList } from "@/hooks/useList";

const STATUS_TABS = [
  { key: "all", label: "All Properties" },
  { key: "Occupied", label: "Occupied" },
  { key: "Available", label: "Available" },
  { key: "Maintenance", label: "Maintenance" },
];

const STATUS_OPTIONS = ["All Statuses", "Available", "Occupied", "Reserved", "Maintenance", "Inactive"];
const OCCUPANCY_OPTIONS = ["All Occupancy", "Leased", "Vacant", "Maintenance Queue"];

const formatCurrency = (amount) => `RM ${amount.toLocaleString("en-MY")}`;

const cycleOption = (options, current) => {
  const currentIndex = options.indexOf(current);
  return options[(currentIndex + 1) % options.length];
};

const getStatusStyles = (status) => {
  if (status === "Available") {
    return {
      badge: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold",
      dot: "w-2 h-2 rounded-full bg-success inline-block",
    };
  }

  if (status === "Maintenance") {
    return {
      badge: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fffbeb] text-highlight text-xs font-semibold",
      dot: "w-2 h-2 rounded-full bg-highlight inline-block",
    };
  }

  if (status === "Reserved") {
    return {
      badge: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6063ee] text-[#fffbff] text-xs font-semibold",
      dot: "w-2 h-2 rounded-full bg-[#fffbff] inline-block",
    };
  }

  if (status === "Inactive") {
    return {
      badge: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#f1f5f9] text-[#475569] text-xs font-semibold",
      dot: "w-2 h-2 rounded-full bg-[#475569] inline-block",
    };
  }

  return {
    badge: "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-scene text-primary text-xs font-semibold",
    dot: "w-2 h-2 rounded-full bg-primary-dark inline-block",
  };
};

const getContractStyles = (status) => {
  if (status === "Expiring Soon") {
    return {
      className: "text-xs text-highlight font-medium flex items-center gap-1",
      icon: "schedule",
    };
  }

  if (status === "No Contract") {
    return {
      className: "text-xs text-[#475569] font-medium",
      icon: null,
    };
  }

  if (status === "Scheduled Repair") {
    return {
      className: "text-xs text-subtle font-medium",
      icon: null,
    };
  }

  if (status === "Ready to Lease") {
    return {
      className: "text-xs text-success font-medium flex items-center gap-1",
      icon: "verified",
    };
  }

  return {
    className: "text-xs text-success font-medium flex items-center gap-1",
    icon: "check_circle",
  };
};


const renderTenant = (property) => {
  if (property.status === "Available") {
    return (
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#f1f5f9] text-[#475569] text-xs font-semibold flex items-center justify-center flex-shrink-0">
          {property.tenant.initials}
        </span>
        <span className="text-xs font-semibold text-subtle italic">{property.tenant.status}</span>
      </div>
    );
  }

  if (property.status === "Maintenance") {
    return (
      <div className="flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-[#fffbeb] text-highlight text-xs font-semibold flex items-center justify-center flex-shrink-0">
          <Icon name="hvac" className="text-sm" />
        </span>
        <span className="text-xs font-semibold text-highlight">{property.tenant.status}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-full bg-scene text-primary text-xs font-semibold flex items-center justify-center flex-shrink-0">
        {property.tenant.initials}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-xs font-semibold text-scene-content truncate">{property.tenant.name}</span>
        <span className={`text-xs font-normal ${property.contract.status === "Expiring Soon" ? "text-highlight" : "text-success"}`}>
          {property.tenant.status}
        </span>
      </div>
    </div>
  );
};

export default function PropertiesPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("All Locations");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedStatus, setSelectedStatus] = useState("All Statuses");
  const [selectedOccupancy, setSelectedOccupancy] = useState("All Occupancy");
  const [view, setView] = useState("table");

  // Unfiltered list, only used for KPIs, tab counts and select options.
  const { data: properties } = useList("/properties/list");

  const locationOptions = useMemo(() => ["All Locations", ...Array.from(new Set(properties.map((p) => p.location)))], [properties]);
  const typeOptions = useMemo(() => ["All Types", ...Array.from(new Set(properties.map((p) => p.type)))], [properties]);

  const tabCounts = useMemo(
    () => ({
      all: properties.length,
      Occupied: properties.filter((p) => p.status === "Occupied").length,
      Available: properties.filter((p) => p.status === "Available").length,
      Maintenance: properties.filter((p) => p.status === "Maintenance").length,
    }),
    [properties],
  );

  const params = {
    keyword: search.trim(),
    status: activeTab === "all" ? "" : activeTab,
    detail_status: selectedStatus === "All Statuses" ? "" : selectedStatus,
    location: selectedLocation === "All Locations" ? "" : selectedLocation,
    type: selectedType === "All Types" ? "" : selectedType,
    occupancy: selectedOccupancy === "All Occupancy" ? "" : selectedOccupancy,
  };

  const handleTabChange = (tab) => setActiveTab(tab);
  const handleSearchChange = (event) => setSearch(event.target.value);
  const handleCycle = (setter, options, current) => setter(cycleOption(options, current));

  const leasedUnits = tabCounts.Occupied;
  const occupancyRate = properties.length ? ((leasedUnits / properties.length) * 100).toFixed(1) : "0.0";
  const availableUnits = tabCounts.Available;
  const maintenanceUnits = tabCounts.Maintenance;

  return (
    <></>
    //     <div className="flex flex-col w-full">
    //       <div className="p-6 md:p-8 flex flex-col gap-6 max-w-[1600px] mx-auto w-full">
    //         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    //           <div className="bg-accent rounded-xl p-4 shadow flex items-center justify-between">
    //             <div className="flex flex-col">
    //               <span className="text-xs font-semibold text-subtle uppercase">Total Portfolio</span>
    //               <span className="text-2xl font-semibold text-scene-content mt-0.5">
    //                 {properties.length} <span className="text-xs text-subtle font-normal">Units</span>
    //               </span>
    //               <span className="text-xs font-normal text-success flex items-center gap-1 mt-1">
    //                 <Icon name="trending_up" /> 100% Monitored
    //               </span>
    //             </div>
    //             <div className="w-12 h-12 rounded-xl bg-[#e5eeff] flex items-center justify-center text-primary-dark">
    //               <Icon name="apartment" className="text-2xl" />
    //             </div>
    //           </div>
    //           <div className="bg-accent rounded-xl p-4 shadow flex items-center justify-between">
    //             <div className="flex flex-col">
    //               <span className="text-xs font-semibold text-subtle uppercase">Occupancy Rate</span>
    //               <span className="text-2xl font-semibold text-scene-content mt-0.5">{occupancyRate}%</span>
    //               <span className="text-xs font-normal text-primary flex items-center gap-1 mt-1">
    //                 <span className="w-2 h-2 rounded-full bg-primary-dark inline-block" /> {leasedUnits} Leased units
    //               </span>
    //             </div>
    //             <div className="w-12 h-12 rounded-xl bg-scene flex items-center justify-center text-primary">
    //               <Icon name="verified_user" className="text-2xl" />
    //             </div>
    //           </div>
    //           <div className="bg-accent rounded-xl p-4 shadow flex items-center justify-between">
    //             <div className="flex flex-col">
    //               <span className="text-xs font-semibold text-subtle uppercase">Vacant &amp; Ready</span>
    //               <span className="text-2xl font-semibold text-scene-content mt-0.5">
    //                 {availableUnits} <span className="text-xs text-subtle font-normal">Units</span>
    //               </span>
    //               <span className="text-xs font-normal text-success flex items-center gap-1 mt-1">
    //                 <Icon name="bolt" /> Immediate move-in
    //               </span>
    //             </div>
    //             <div className="w-12 h-12 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-success">
    //               <Icon name="door_open" className="text-2xl" />
    //             </div>
    //           </div>
    //           <div className="bg-accent rounded-xl p-4 shadow flex items-center justify-between">
    //             <div className="flex flex-col">
    //               <span className="text-xs font-semibold text-subtle uppercase">Under Maintenance</span>
    //               <span className="text-2xl font-semibold text-scene-content mt-0.5">
    //                 {maintenanceUnits} <span className="text-xs text-subtle font-normal">Units</span>
    //               </span>
    //               <span className="text-xs font-normal text-highlight flex items-center gap-1 mt-1">
    //                 <Icon name="build_circle" /> In repair queue
    //               </span>
    //             </div>
    //             <div className="w-12 h-12 rounded-xl bg-[#fffbeb] flex items-center justify-center text-highlight">
    //               <Icon name="home_repair_service" className="text-2xl" />
    //             </div>
    //           </div>
    //         </div>

    //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
    //           <div className="flex flex-col">
    //             <h1 className="text-3xl font-semibold text-scene-content">Properties &amp; Units</h1>
    //             <p className="text-sm font-normal text-subtle mt-1">Manage your real estate portfolio, room assignments, and occupancy status.</p>
    //           </div>
    //         </div>

    //         <DataTable
    //           api="/properties/list"
    //           params={params}
    //           title="Property Directory"
    //           defaultPerPage={6}
    //           table={view === "table"}
    //           emptyText="No properties match the current filters."
    //           buttons={
    //             <>
    //             <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-primary/10 text-scene-content text-xs font-semibold rounded-xl shadow transition-all" type="button">
    //               <Icon name="file_download" className="text-lg" />
    //               <span className="">Export CSV</span>
    //             </button>
    //             <Link
    //               href="/properties/new"
    //               className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary-dark text-primary-content text-xs font-semibold rounded-xl shadow transition-all"
    //             >
    //               <Icon name="add" className="text-[20px]" />
    //               <span className="">+ Add Property</span>
    //             </Link>
    //             </>
    //           }
    //           filters={
    //             <>
    //           <div className="flex items-center gap-2 px-6 pt-4 pb-2 overflow-x-auto bg-accent">
    //             {STATUS_TABS.map((tab) => {
    //               const active = activeTab === tab.key;
    //               const pillClass =
    //                 tab.key === "Occupied"
    //                   ? "px-2 py-0.5 rounded-full bg-scene text-primary text-xs font-semibold"
    //                   : tab.key === "Available"
    //                     ? "px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold"
    //                     : tab.key === "Maintenance"
    //                       ? "px-2 py-0.5 rounded-full bg-[#fffbeb] text-highlight text-xs font-semibold"
    //                       : "px-2 py-0.5 rounded-full bg-[color:color-mix(in_srgb,var(--primary-content)_20%,transparent)] text-primary-content text-xs font-semibold";

    //               return (
    //                 <button
    //                   key={tab.key}
    //                   className={
    //                     active
    //                       ? "tab-btn active inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-dark text-primary-content text-xs font-semibold transition-all shadow"
    //                       : "tab-btn inline-flex items-center gap-2 px-4 py-2 rounded-xl text-subtle hover:text-scene-content hover:bg-primary/10 text-xs font-semibold transition-all"
    //                   }
    //                   type="button"
    //                   onClick={() => handleTabChange(tab.key)}
    //                 >
    //                   <span className="">{tab.label}</span>
    //                   <span className={pillClass}>{tabCounts[tab.key]}</span>
    //                 </button>
    //               );
    //             })}
    //           </div>

    //           <div className="p-6 bg-accent flex flex-col lg:flex-row items-stretch lg:items-center gap-3 justify-between border-b border-[#c7c4d8]/60">
    //             <div className="relative flex-1 max-w-lg">
    //               <Icon name="search" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-subtle" />
    //               <input
    //                 className="w-full bg-primary/10 rounded-xl pl-10 pr-4 py-2.5 text-xs font-normal text-scene-content placeholder-text-muted outline-none focus:bg-accent transition-all"
    //                 placeholder="Search by property name, unit, or address..."
    //                 type="text"
    //                 value={search}
    //                 onChange={handleSearchChange}
    //               />
    //             </div>

    //             <div className="flex flex-wrap items-center gap-2.5">
    //               <div className="relative">
    //                 <button
    //                   className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold rounded-xl transition-all"
    //                   type="button"
    //                   onClick={() => handleCycle(setSelectedLocation, locationOptions, selectedLocation)}
    //                 >
    //                   <Icon name="location_on" className="text-lg text-subtle" />
    //                   <span className="">{selectedLocation}</span>
    //                   <Icon name="expand_more" className="text-subtle" />
    //                 </button>
    //               </div>

    //               <div className="relative">
    //                 <button
    //                   className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold rounded-xl transition-all"
    //                   type="button"
    //                   onClick={() => handleCycle(setSelectedType, typeOptions, selectedType)}
    //                 >
    //                   <Icon name="category" className="text-lg text-subtle" />
    //                   <span className="">{selectedType}</span>
    //                   <Icon name="expand_more" className="text-subtle" />
    //                 </button>
    //               </div>

    //               <div className="relative">
    //                 <button
    //                   className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold rounded-xl transition-all"
    //                   type="button"
    //                   onClick={() => handleCycle(setSelectedStatus, STATUS_OPTIONS, selectedStatus)}
    //                 >
    //                   <Icon name="filter_alt" className="text-lg text-subtle" />
    //                   <span className="">{selectedStatus}</span>
    //                   <Icon name="expand_more" className="text-subtle" />
    //                 </button>
    //               </div>

    //               <div className="relative">
    //                 <button
    //                   className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold rounded-xl transition-all"
    //                   type="button"
    //                   onClick={() => handleCycle(setSelectedOccupancy, OCCUPANCY_OPTIONS, selectedOccupancy)}
    //                 >
    //                   <Icon name="checklist" className="text-lg text-subtle" />
    //                   <span className="">{selectedOccupancy}</span>
    //                   <Icon name="expand_more" className="text-subtle" />
    //                 </button>
    //               </div>

    //               <button className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold rounded-xl transition-all" type="button">
    //                 <Icon name="view_column" className="text-lg text-subtle" />
    //                 <span className="">Columns</span>
    //               </button>

    //               <div className="flex items-center bg-primary/10 p-1 rounded-xl">
    //                 <button
    //                   aria-label="Table View"
    //                   className={view === "table" ? "p-2 rounded-lg bg-accent text-primary-dark shadow" : "p-2 rounded-lg text-subtle hover:text-scene-content transition-colors"}
    //                   type="button"
    //                   onClick={() => setView("table")}
    //                 >
    //                   <Icon name="table_rows" className="text-lg block" />
    //                 </button>
    //                 <button
    //                   aria-label="Grid View"
    //                   className={view === "grid" ? "p-2 rounded-lg bg-accent text-primary-dark shadow" : "p-2 rounded-lg text-subtle hover:text-scene-content transition-colors"}
    //                   type="button"
    //                   onClick={() => setView("grid")}
    //                 >
    //                   <Icon name="grid_view" className="text-lg block" />
    //                 </button>
    //               </div>
    //             </div>
    //           </div>
    //             </>
    //           }
    //           header={
    //                   <tr className="bg-primary/10">
    //                     <th className="w-12 px-6 py-3 text-center" scope="col">
    //                       <input className="rounded w-4 h-4 text-primary-dark focus:ring-0 cursor-pointer" type="checkbox" />
    //                     </th>
    //                     <th className="px-4 py-3 text-xs font-semibold text-subtle uppercase" scope="col">
    //                       Property &amp; Unit
    //                     </th>
    //                     <th className="px-4 py-3 text-xs font-semibold text-subtle uppercase" scope="col">
    //                       Property Type
    //                     </th>
    //                     <th className="px-4 py-3 text-xs font-semibold text-subtle uppercase" scope="col">
    //                       Assigned Tenant
    //                     </th>
    //                     <th className="px-4 py-3 text-xs font-semibold text-subtle uppercase" scope="col">
    //                       Monthly Rent
    //                     </th>
    //                     <th className="px-4 py-3 text-xs font-semibold text-subtle uppercase" scope="col">
    //                       Status
    //                     </th>
    //                     <th className="px-4 py-3 text-xs font-semibold text-subtle uppercase" scope="col">
    //                       Contract Status
    //                     </th>
    //                     <th className="px-6 py-3 text-xs font-semibold text-subtle uppercase text-right" scope="col">
    //                       Actions
    //                     </th>
    //                   </tr>
    //           }
    //           body={({ rows }) =>
    //             view === "grid" ? (
    //             <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 p-6">
    //               {rows.map((property) => {
    //                 const statusStyles = getStatusStyles(property.status);
    //                 const contractStyles = getContractStyles(property.contract.status);

    //                 return (
    //                   <Link
    //                     key={property.id}
    //                     href={`/properties/${property.id}`}
    //                     className="bg-primary/10 rounded-xl p-4 hover:bg-[#e5eeff] transition-colors flex flex-col gap-3"
    //                   >
    //                     <div className="flex items-center justify-between gap-3">
    //                       <div className="flex items-center gap-3 min-w-0">
    //                         <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${property.status === "Available" ? "bg-[#ecfdf5] text-success" : property.status === "Maintenance" ? "bg-[#fffbeb] text-highlight" : "bg-scene text-primary"}`}>
    //                           <Icon name={property.icon} className="text-[20px]" />
    //                         </div>
    //                         <div className="min-w-0">
    //                           <div className="text-xs text-scene-content font-semibold truncate">{property.name}</div>
    //                           <div className="text-xs font-medium text-subtle">{property.unitLabel}</div>
    //                         </div>
    //                       </div>
    //                       <span className={statusStyles.badge}>
    //                         <span className={statusStyles.dot} />
    //                         {property.status}
    //                       </span>
    //                     </div>
    //                     <div className="flex items-center justify-between gap-3">
    //                       <div>
    //                         <div className="text-lg text-scene-content font-semibold">{formatCurrency(property.rent)}</div>
    //                         <div className="text-xs font-normal text-subtle">per month</div>
    //                       </div>
    //                       <div className="text-right">
    //                         <div className="text-xs font-semibold text-subtle uppercase">Type</div>
    //                         <div className="text-xs font-semibold text-scene-content">{property.type}</div>
    //                       </div>
    //                     </div>
    //                     <div className="text-xs font-normal text-subtle">{property.address}</div>
    //                     <div className="flex items-center justify-between gap-3">
    //                       <div className="text-xs font-semibold text-scene-content">{property.tenant.name || property.tenant.status}</div>
    //                       <div className={contractStyles.className}>
    //                         {contractStyles.icon ? <Icon name={contractStyles.icon} /> : null}
    //                         {property.contract.status}
    //                       </div>
    //                     </div>
    //                   </Link>
    //                 );
    //               })}
    //             </div>
    //             ) : (
    //               <>
    // {                    rows.map((property) => {
    //                       const statusStyles = getStatusStyles(property.status);
    //                       const contractStyles = getContractStyles(property.contract.status);
    //                       const iconToneClass =
    //                         property.status === "Available"
    //                           ? "w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-success flex-shrink-0"
    //                           : property.status === "Maintenance"
    //                             ? "w-10 h-10 rounded-xl bg-[#fffbeb] flex items-center justify-center text-highlight flex-shrink-0"
    //                             : "w-10 h-10 rounded-xl bg-scene flex items-center justify-center text-primary flex-shrink-0";

    //                       return (
    //                         <tr key={property.id} className="hover:bg-primary/10 transition-colors group">
    //                           <td className="w-12 px-6 py-3.5 text-center">
    //                             <input className="rounded w-4 h-4 text-primary-dark focus:ring-0 cursor-pointer" type="checkbox" />
    //                           </td>
    //                           <td className="px-4 py-3.5">
    //                             <Link href={`/properties/${property.id}`} className="flex items-center gap-3">
    //                               <div className={iconToneClass}>
    //                                 <Icon name={property.icon} className="text-[20px]" />
    //                               </div>
    //                               <div className="flex flex-col min-w-0">
    //                                 <span className="text-xs text-scene-content font-semibold truncate">{property.name}</span>
    //                                 <span className="text-xs font-medium text-subtle">{property.unitLabel}</span>
    //                               </div>
    //                             </Link>
    //                           </td>
    //                           <td className="px-4 py-3.5">
    //                             <div className="flex items-center gap-2">
    //                               <span className="px-2.5 py-1 rounded-md bg-[#e5eeff] text-xs text-[#464555] font-medium">{property.type}</span>
    //                             </div>
    //                           </td>
    //                           <td className="px-4 py-3.5">{renderTenant(property)}</td>
    //                           <td className="px-4 py-3.5">
    //                             <div className="flex flex-col">
    //                               <span className="text-lg text-scene-content font-semibold">{formatCurrency(property.rent)}</span>
    //                               <span className="text-xs font-normal text-subtle">per month</span>
    //                             </div>
    //                           </td>
    //                           <td className="px-4 py-3.5">
    //                             <span className={statusStyles.badge}>
    //                               <span className={statusStyles.dot} />
    //                               {property.status}
    //                             </span>
    //                           </td>
    //                           <td className="px-4 py-3.5">
    //                             <div className="flex flex-col">
    //                               <span className={contractStyles.className}>
    //                                 {contractStyles.icon ? <Icon name={contractStyles.icon} /> : null}
    //                                 {property.contract.status}
    //                               </span>
    //                               <span className={`text-xs ${property.contract.status === "Expiring Soon" ? "text-subtle font-medium" : "text-subtle"}`}>
    //                                 {property.contract.note}
    //                               </span>
    //                             </div>
    //                           </td>
    //                           <td className="px-6 py-3.5 text-right">
    //                             <div className="flex items-center justify-end gap-1">
    //                               <Link
    //                                 href={`/properties/${property.id}`}
    //                                 aria-label={`Quick View ${property.unit}`}
    //                                 className="p-2 rounded-lg text-subtle hover:text-primary-dark hover:bg-[#e5eeff] transition-colors"
    //                               >
    //                                 <Icon name="visibility" className="text-lg" />
    //                               </Link>
    //                               <button aria-label="Unit Options" className="p-2 rounded-lg text-subtle hover:text-scene-content hover:bg-[#e5eeff] transition-colors" type="button">
    //                                 <Icon name="more_vert" className="text-lg" />
    //                               </button>
    //                             </div>
    //                           </td>
    //                         </tr>
    //                       );
    //                     })}
    //               </>
    //             )
    //           }
    //         />

    //         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    //           <div className="bg-accent rounded-xl p-4 shadow flex flex-col justify-between">
    //             <div>
    //               <div className="flex items-center justify-between">
    //                 <span className="text-lg font-semibold text-scene-content">Typology Breakdown</span>
    //                 <Icon name="pie_chart" className="text-subtle text-[20px]" />
    //               </div>
    //               <p className="text-xs font-normal text-subtle mt-1">Spread of registered floor plans across estates.</p>
    //               <div className="mt-4 flex flex-col gap-2.5">
    //                 <div>
    //                   <div className="flex justify-between text-xs font-semibold mb-1">
    //                     <span className="text-scene-content font-medium">Condominiums (24)</span>
    //                     <span className="text-subtle">50%</span>
    //                   </div>
    //                   <div className="w-full h-2 rounded-full bg-[#e5eeff] overflow-hidden">
    //                     <div className="bg-primary-dark h-full rounded-full" style={{ width: "50%" }} />
    //                   </div>
    //                 </div>
    //                 <div>
    //                   <div className="flex justify-between text-xs font-semibold mb-1">
    //                     <span className="text-scene-content font-medium">Studios &amp; Lofts (16)</span>
    //                     <span className="text-subtle">33%</span>
    //                   </div>
    //                   <div className="w-full h-2 rounded-full bg-[#e5eeff] overflow-hidden">
    //                     <div className="bg-[#6063ee] h-full rounded-full" style={{ width: "33%" }} />
    //                   </div>
    //                 </div>
    //                 <div>
    //                   <div className="flex justify-between text-xs font-semibold mb-1">
    //                     <span className="text-scene-content font-medium">Penthouses &amp; Villas (8)</span>
    //                     <span className="text-subtle">17%</span>
    //                   </div>
    //                   <div className="w-full h-2 rounded-full bg-[#e5eeff] overflow-hidden">
    //                     <div className="bg-[#4d44e3] h-full rounded-full" style={{ width: "17%" }} />
    //                   </div>
    //                 </div>
    //               </div>
    //             </div>
    //             <div className="pt-4 flex items-center justify-between text-subtle">
    //               <span className="text-xs font-normal">Updated today at 09:30 AM</span>
    //               <a className="text-xs font-semibold text-primary-dark hover:underline" href="#">
    //                 View Analytics
    //               </a>
    //             </div>
    //           </div>

    //           <div className="bg-accent rounded-xl p-4 shadow flex flex-col justify-between">
    //             <div>
    //               <div className="flex items-center justify-between">
    //                 <span className="text-lg font-semibold text-scene-content">Market Rate Benchmarking</span>
    //                 <Icon name="price_change" className="text-success text-[20px]" />
    //               </div>
    //               <p className="text-xs font-normal text-subtle mt-1">
    //                 Regional rental trends suggest +4.2% yield uplift on upcoming studio lease expirations.
    //               </p>
    //               <div className="mt-4 p-3 rounded-xl bg-[#ecfdf5] flex items-center gap-3">
    //                 <Icon name="insights" className="text-success text-[24px]" />
    //                 <div className="flex flex-col">
    //                   <span className="text-xs text-success font-semibold">RM +180 Avg Potential</span>
    //                   <span className="text-xs font-normal text-subtle">Applies to 3 expiring units this month</span>
    //                 </div>
    //               </div>
    //             </div>
    //             <button className="mt-4 w-full py-2.5 rounded-xl bg-primary/10 hover:bg-[#e5eeff] text-scene-content text-xs font-semibold transition-colors text-center" type="button">
    //               Review Benchmark Report
    //             </button>
    //           </div>

    //           <div className="bg-accent rounded-xl p-4 shadow flex flex-col justify-between">
    //             <div>
    //               <div className="flex items-center justify-between">
    //                 <span className="text-lg font-semibold text-scene-content">Maintenance Queue</span>
    //                 <span className="px-2 py-0.5 rounded-full bg-[#fffbeb] text-highlight text-xs font-semibold">3 Active</span>
    //               </div>
    //               <p className="text-xs font-normal text-subtle mt-1">High-priority technician dispatches for Kiara Bay &amp; Aurora block.</p>
    //               <div className="mt-4 flex flex-col gap-2">
    //                 <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10">
    //                   <div className="flex items-center gap-2">
    //                     <span className="w-2 h-2 rounded-full bg-error" />
    //                     <span className="text-xs font-semibold text-scene-content">Kiara Bay #K-21</span>
    //                   </div>
    //                   <span className="text-xs font-medium text-subtle">HVAC Coil Repair</span>
    //                 </div>
    //                 <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10">
    //                   <div className="flex items-center gap-2">
    //                     <span className="w-2 h-2 rounded-full bg-highlight" />
    //                     <span className="text-xs font-semibold text-scene-content">Metro City #M-03</span>
    //                   </div>
    //                   <span className="text-xs font-medium text-subtle">Final Key Handoff</span>
    //                 </div>
    //               </div>
    //             </div>
    //             <button className="mt-4 w-full py-2.5 rounded-xl bg-primary text-primary-content hover:bg-primary-dark text-xs font-semibold transition-colors text-center" type="button">
    //               Open Field Maintenance
    //             </button>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
  );
}