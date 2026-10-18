export const dashboardActions = [
  {
    id: "add-property",
    href: "/properties/new",
    icon: "add_home",
    className:
      "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent text-scene-content text-xs font-semibold shadow hover:bg-primary/10 transition-all",
    label: "+ Add Property",
  },
  {
    id: "record-payment",
    href: "/payments",
    icon: "payments",
    className:
      "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-dark text-primary-content text-xs font-semibold shadow hover:bg-primary transition-all",
    label: "Record Payment",
  },
];

export const dashboardKpis = [
  {
    id: "properties",
    cardClassName:
      "bg-accent rounded-2xl p-4 shadow relative overflow-hidden flex flex-col justify-between group hover:shadow transition-shadow",
    iconWrapClassName: "w-10 h-10 rounded-xl bg-scene text-primary flex items-center justify-center",
    icon: "apartment",
    badgeClassName:
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold",
    badgeIcon: "trending_up",
    badgeText: "+8%",
    labelClassName: "text-xs font-semibold text-subtle uppercase",
    label: "Total Properties",
    valueRowClassName: "flex items-baseline gap-2 mt-1",
    value: "48",
    valueClassName: "text-2xl font-semibold text-scene-content",
    valueSuffix: "Units",
    valueSuffixClassName: "text-xs font-normal text-subtle",
    footerClassName:
      "mt-3 pt-3 flex items-center justify-between text-subtle text-xs font-normal bg-primary/10/50 -mx-4 -mb-4 px-4 py-2.5",
    footerItems: [
      { id: "occupied", dotClassName: "w-2 h-2 rounded-full bg-primary-dark", label: "38 Occupied" },
      { id: "available", dotClassName: "w-2 h-2 rounded-full bg-success", label: "7 Avail" },
      { id: "maintenance", dotClassName: "w-2 h-2 rounded-full bg-highlight", label: "3 Maint" },
    ],
  },
  {
    id: "tenants",
    cardClassName:
      "bg-accent rounded-2xl p-4 shadow relative overflow-hidden flex flex-col justify-between group hover:shadow transition-shadow",
    iconWrapClassName: "w-10 h-10 rounded-xl bg-[#dce9ff] text-primary-dark flex items-center justify-center",
    icon: "group",
    badgeClassName:
      "inline-flex items-center px-2 py-0.5 rounded-full bg-[#f1f5f9] text-[#475569] text-xs font-semibold",
    badgeText: "93% Retained",
    labelClassName: "text-xs font-semibold text-subtle uppercase",
    label: "Total Tenants",
    valueRowClassName: "flex items-baseline gap-2 mt-1",
    value: "42",
    valueClassName: "text-2xl font-semibold text-scene-content",
    valueSuffix: "Active",
    valueSuffixClassName: "text-xs font-normal text-subtle",
    footerClassName:
      "mt-3 pt-3 flex items-center justify-between text-subtle text-xs font-normal bg-primary/10/50 -mx-4 -mb-4 px-4 py-2.5",
    footerItems: [
      { id: "leased", dotClassName: "w-2 h-2 rounded-full bg-primary", label: "42 Leased" },
      { id: "former", dotClassName: "w-2 h-2 rounded-full bg-subtle", label: "3 Former" },
    ],
  },
  {
    id: "revenue",
    cardClassName:
      "bg-accent rounded-2xl p-4 shadow relative overflow-hidden flex flex-col justify-between group hover:shadow transition-shadow",
    iconWrapClassName: "w-10 h-10 rounded-xl bg-[#ecfdf5] text-success flex items-center justify-center",
    icon: "account_balance_wallet",
    badgeClassName:
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ecfdf5] text-success text-xs font-semibold",
    badgeIcon: "arrow_upward",
    badgeText: "+12.4%",
    labelClassName: "text-xs font-semibold text-subtle uppercase",
    label: "Monthly Revenue",
    valueRowClassName: "flex items-baseline gap-1 mt-1",
    prefix: "RM",
    prefixClassName: "text-xs text-subtle font-normal",
    value: "58,400",
    valueClassName: "text-2xl font-semibold text-scene-content",
    footerClassName:
      "mt-3 pt-3 flex items-center justify-between text-subtle text-xs font-normal bg-primary/10/50 -mx-4 -mb-4 px-4 py-2.5",
    footerItems: [
      { id: "paid", textClassName: "text-success font-medium", label: "Paid 89%" },
      { id: "target", label: "Target: RM 65k" },
    ],
  },
  {
    id: "outstanding",
    cardClassName:
      "bg-[#fff1f2] rounded-2xl p-4 shadow relative overflow-hidden flex flex-col justify-between group hover:shadow transition-shadow",
    iconWrapClassName: "w-10 h-10 rounded-xl bg-accent text-error flex items-center justify-center shadow",
    icon: "error_outline",
    badgeClassName:
      "inline-flex items-center px-2 py-0.5 rounded-full bg-accent text-error text-xs font-semibold shadow",
    badgeText: "4 Overdue Bills",
    labelClassName: "text-xs text-error uppercase font-semibold",
    label: "Outstanding Amount",
    valueRowClassName: "flex items-baseline gap-1 mt-1",
    prefix: "RM",
    prefixClassName: "text-xs text-error font-normal",
    value: "7,200",
    valueClassName: "text-2xl font-semibold text-error",
    footerClassName:
      "mt-3 pt-3 flex items-center justify-between text-error text-xs bg-[color:color-mix(in_srgb,var(--accent)_60%,transparent)] -mx-4 -mb-4 px-4 py-2.5 font-medium",
    footerItems: [
      { id: "immediate", label: "Immediate: RM 2,450" },
      { id: "remind", label: "Remind All", textClassName: "underline cursor-pointer hover:opacity-80" },
    ],
  },
];

export const dashboardFeatureCard = {
  image: "/stitch/dashboard-spec.png",
  imageAlt: "Property Operational Dashboard layout and reference architecture",
  badge: "Standard Spec",
  meta: "Operational Architecture V2",
  title: "NeighborLink Core Multi-Unit Engine",
  description:
    "Integrated monitoring of lease lifecycles, real-time meter readings, automated utility split-billing, and immediate tenant escalation queues.",
};

export const dashboardRevenue = {
  periods: [
    { id: "monthly", label: "Monthly" },
    { id: "weekly", label: "Weekly" },
  ],
  series: {
    monthly: {
      reportGenerated: "Report generated Oct 24, 09:45 AM",
      trendText: "Collection cycle is tracking +3.2 days faster than Q3 average.",
      bars: [
        { id: "jan", label: "Jan", rentalHeight: "55%", extraHeight: "20%", rentalTitle: "Jan Rental: RM 36,000", extraTitle: "Jan Extra: RM 5,200" },
        { id: "feb", label: "Feb", rentalHeight: "60%", extraHeight: "25%", rentalTitle: "Feb Rental: RM 39,000", extraTitle: "Feb Extra: RM 6,400" },
        { id: "mar", label: "Mar", rentalHeight: "68%", extraHeight: "22%", rentalTitle: "Mar Rental: RM 42,000", extraTitle: "Mar Extra: RM 6,100" },
        { id: "apr", label: "Apr", rentalHeight: "64%", extraHeight: "30%", rentalTitle: "Apr Rental: RM 41,500", extraTitle: "Apr Extra: RM 7,800" },
        { id: "may", label: "May", rentalHeight: "72%", extraHeight: "26%", rentalTitle: "May Rental: RM 46,000", extraTitle: "May Extra: RM 7,100" },
        { id: "jun", label: "Jun", rentalHeight: "78%", extraHeight: "28%", rentalTitle: "Jun Rental: RM 50,000", extraTitle: "Jun Extra: RM 7,500" },
        { id: "jul", label: "Jul", rentalHeight: "75%", extraHeight: "32%", rentalTitle: "Jul Rental: RM 48,200", extraTitle: "Jul Extra: RM 8,200" },
        { id: "aug", label: "Aug", rentalHeight: "82%", extraHeight: "35%", rentalTitle: "Aug Rental: RM 52,400", extraTitle: "Aug Extra: RM 8,900" },
        { id: "sep", label: "Sep", rentalHeight: "86%", extraHeight: "34%", rentalTitle: "Sep Rental: RM 55,000", extraTitle: "Sep Extra: RM 8,700" },
        {
          id: "oct",
          label: "Oct",
          rentalHeight: "92%",
          extraHeight: "38%",
          rentalTitle: "Oct Rental: RM 58,400",
          extraTitle: "Oct Extra: RM 9,200",
          extraBarClassName: "w-3.5 bg-[#4648d4] rounded-t-sm transition-all hover:opacity-80",
          labelClassName: "text-xs text-primary-dark font-semibold",
        },
      ],
    },
    weekly: {
      reportGenerated: "Report generated Week 42, 09:45 AM",
      trendText: "Weekly collections are tracking +1.1 days faster than the monthly baseline.",
      bars: [
        { id: "wk1", label: "W1", rentalHeight: "58%", extraHeight: "18%", rentalTitle: "Week 1 Rental: RM 8,900", extraTitle: "Week 1 Extra: RM 1,600" },
        { id: "wk2", label: "W2", rentalHeight: "62%", extraHeight: "22%", rentalTitle: "Week 2 Rental: RM 9,400", extraTitle: "Week 2 Extra: RM 1,900" },
        { id: "wk3", label: "W3", rentalHeight: "66%", extraHeight: "20%", rentalTitle: "Week 3 Rental: RM 9,800", extraTitle: "Week 3 Extra: RM 1,700" },
        { id: "wk4", label: "W4", rentalHeight: "71%", extraHeight: "24%", rentalTitle: "Week 4 Rental: RM 10,200", extraTitle: "Week 4 Extra: RM 2,000" },
        { id: "wk5", label: "W5", rentalHeight: "69%", extraHeight: "26%", rentalTitle: "Week 5 Rental: RM 10,000", extraTitle: "Week 5 Extra: RM 2,200" },
        { id: "wk6", label: "W6", rentalHeight: "74%", extraHeight: "27%", rentalTitle: "Week 6 Rental: RM 10,600", extraTitle: "Week 6 Extra: RM 2,300" },
        { id: "wk7", label: "W7", rentalHeight: "77%", extraHeight: "29%", rentalTitle: "Week 7 Rental: RM 10,900", extraTitle: "Week 7 Extra: RM 2,500" },
        {
          id: "wk8",
          label: "W8",
          rentalHeight: "81%",
          extraHeight: "31%",
          rentalTitle: "Week 8 Rental: RM 11,300",
          extraTitle: "Week 8 Extra: RM 2,700",
          extraBarClassName: "w-3.5 bg-[#4648d4] rounded-t-sm transition-all hover:opacity-80",
          labelClassName: "text-xs text-primary-dark font-semibold",
        },
      ],
    },
  },
};

export const dashboardOutstandingBills = [
  {
    id: "INV-1082",
    tenant: "John Tan",
    property: "Aurora Apt A-12",
    amount: "RM 1,450",
    dueDate: "Oct 1, 2024",
    statusLabel: "Overdue",
    statusClassName:
      "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#fff1f2] text-error text-xs font-semibold",
    statusDotClassName: "w-2 h-2 rounded-full bg-error",
    recordButtonClassName:
      "px-2.5 py-2 rounded-lg bg-primary-dark text-primary-content text-xs font-semibold hover:bg-primary transition-all",
  },
  {
    id: "INV-1085",
    tenant: "Sarah Lim",
    property: "Horizon B-04",
    amount: "RM 2,200",
    dueDate: "Oct 3, 2024",
    statusLabel: "Pending",
    statusClassName:
      "inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-[#fffbeb] text-highlight text-xs font-semibold",
    statusDotClassName: "w-2 h-2 rounded-full bg-highlight",
    recordButtonClassName:
      "px-2.5 py-2 rounded-lg bg-primary/10 text-scene-content text-xs font-semibold hover:bg-[#dce9ff] transition-all",
  },
];

export const dashboardOccupancy = {
  value: "79.2%",
  label: "Occupied",
  dashArray: "79.2, 100",
  breakdown: [
    { id: "occupied", label: "Occupied", value: "38 Units", dotClassName: "w-2.5 h-2.5 rounded-full bg-primary-dark" },
    { id: "vacant", label: "Vacant", value: "7 Units", dotClassName: "w-2.5 h-2.5 rounded-full bg-success" },
    { id: "repair", label: "Repair", value: "3 Units", dotClassName: "w-2.5 h-2.5 rounded-full bg-highlight" },
    { id: "reserved", label: "Reserved", value: "0 Units", dotClassName: "w-2.5 h-2.5 rounded-full bg-[#4648d4]" },
  ],
  totalLabel: "48 Units Total",
};

export const dashboardExpiringContracts = {
  badge: "2 Pending",
  items: [
    {
      id: "CT-882",
      daysLeft: "14 days left",
      daysClassName:
        "text-xs text-error bg-[#fff1f2] px-2 py-0.5 rounded-full font-semibold",
      tenant: "David Wong",
      property: "Unit 12B · Aurora Complex",
      buttonClassName:
        "px-3 py-2 rounded-lg bg-primary-dark text-primary-content text-xs font-semibold hover:bg-primary transition-all shadow",
    },
    {
      id: "CT-791",
      daysLeft: "22 days left",
      daysClassName:
        "text-xs text-highlight bg-[#fffbeb] px-2 py-0.5 rounded-full font-semibold",
      tenant: "Amina Binti",
      property: "Unit 05A · Sky Suites",
      buttonClassName:
        "px-3 py-2 rounded-lg bg-accent text-scene-content text-xs font-semibold hover:bg-[#dce9ff] transition-all shadow",
    },
  ],
};

export const dashboardComplaints = {
  openTicketsLabel: "3 Open Tickets",
  items: [
    {
      id: "complaint-aircon",
      icon: "ac_unit",
      iconWrapClassName:
        "w-8 h-8 rounded-lg bg-[#fff1f2] text-error flex items-center justify-center shrink-0 mt-0.5",
      title: "Aircon leaking in Master Bedroom",
      priority: "High",
      priorityClassName: "text-xs text-error font-semibold uppercase",
      description: "Unit A-12 · Assigned to HVAC Tech",
    },
    {
      id: "complaint-wifi",
      icon: "wifi_off",
      iconWrapClassName:
        "w-8 h-8 rounded-lg bg-[#fffbeb] text-highlight flex items-center justify-center shrink-0 mt-0.5",
      title: "WiFi disconnected / Router issue",
      priority: "Med",
      priorityClassName: "text-xs text-highlight font-semibold uppercase",
      description: "Unit B-04 · Modem restart pending",
    },
  ],
};
