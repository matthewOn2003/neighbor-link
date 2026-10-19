// Mock dataset for the admin dashboard.
// Shapes mirror the backend concepts (properties / units / tenants / contracts / bills)
// so the overview can be swapped for a real `/dashboard/overview` endpoint later.
// Reference date: 2026-10-20 (Asia/Kuala_Lumpur). Amounts are in MYR.

export const MOCK_TODAY = "2026-10-20";

export const dashboardProperties = [
  { id: 1, name: "Sentul Residensi", totalUnits: 48, occupiedUnits: 44, maintenanceUnits: 1 },
  { id: 2, name: "Bangsar Garden Suites", totalUnits: 32, occupiedUnits: 27, maintenanceUnits: 2 },
  { id: 3, name: "Cheras Park Homes", totalUnits: 60, occupiedUnits: 52, maintenanceUnits: 3 },
  { id: 4, name: "KLCC View Serviced", totalUnits: 24, occupiedUnits: 21, maintenanceUnits: 0 },
];

export const dashboardSummary = {
  totalUnits: 164,
  occupiedUnits: 144,
  occupancyRate: 87.8,
  occupancyRatePrevMonth: 85.4,
  activeLeases: 144,
  // Current billing cycle (2026-10)
  cycleBilledAmount: 136800,
  cycleCollectedAmount: 118650,
  cycleOverdueAmount: 9450,
  cycleOverdueCount: 6,
  cycleOutstandingAmount: 18150,
  collectedRateTarget: 92,
  // Contracts / complaints
  contractsExpiring30d: 3,
  contractsExpiring60d: 5,
  openComplaints: 9,
  urgentComplaints: 3,
};

// Billing funnel for the current cycle (counts of bills, total 144).
// Billing funnel for the current cycle. `amount` is the billed amount per group;
// all groups sum to cycleBilledAmount and the paid + partial-paid portion equals cycleCollectedAmount.
export const dashboardCollectionFunnel = [
  { id: "paid", count: 121, amount: 111650 },
  { id: "partial", count: 6, amount: 9000 },
  { id: "unpaid", count: 11, amount: 6700 },
  { id: "overdue", count: 6, amount: 9450 },
];

// Last 12 months. rent = base rent collected, extra = utilities / late fees / maintenance recharges.
export const dashboardRevenueSeries = [
  { month: "2025-11", rent: 96200, extra: 6100 },
  { month: "2025-12", rent: 99800, extra: 7400 },
  { month: "2026-01", rent: 101500, extra: 6800 },
  { month: "2026-02", rent: 102100, extra: 6300 },
  { month: "2026-03", rent: 108400, extra: 7900 },
  { month: "2026-04", rent: 111200, extra: 8200 },
  { month: "2026-05", rent: 114600, extra: 7600 },
  { month: "2026-06", rent: 118900, extra: 8800 },
  { month: "2026-07", rent: 121300, extra: 9100 },
  { month: "2026-08", rent: 124700, extra: 9400 },
  { month: "2026-09", rent: 129800, extra: 9900 },
  { month: "2026-10", rent: 118650, extra: 6400 },
];

// Bills that need follow-up now, sorted by days overdue (desc).
export const dashboardPriorityBills = [
  { id: 2029, tenant: "Lim Jun Hao", property: "KLCC View Serviced", unit: "K-18-02", period: "2026-08", amount: 2150, paid: 0, dueDate: "2026-09-01", status: "overdue" },
  { id: 2038, tenant: "Ahmad Razak", property: "Cheras Park Homes", unit: "C-05-11", period: "2026-09", amount: 1280, paid: 0, dueDate: "2026-10-01", status: "overdue" },
  { id: 2041, tenant: "Tan Wei Ling", property: "Sentul Residensi", unit: "A-12-03", period: "2026-09", amount: 1450, paid: 0, dueDate: "2026-10-05", status: "overdue" },
  { id: 2033, tenant: "Muhammad Haziq", property: "Cheras Park Homes", unit: "C-11-02", period: "2026-09", amount: 1150, paid: 0, dueDate: "2026-10-12", status: "overdue" },
  { id: 2046, tenant: "Priya Nair", property: "Bangsar Garden Suites", unit: "B-02-06", period: "2026-10", amount: 1900, paid: 800, dueDate: "2026-10-10", status: "partial" },
  { id: 2050, tenant: "Sarah Chen", property: "Sentul Residensi", unit: "A-08-14", period: "2026-10", amount: 1450, paid: 0, dueDate: "2026-10-25", status: "unpaid" },
];

// Leases ending within 60 days.
export const dashboardExpiringContracts = [
  { id: 311, tenant: "Chong Mei Yee", property: "Bangsar Garden Suites", unit: "B-07-01", endDate: "2026-10-28", daysLeft: 8, renewal: "not_started" },
  { id: 298, tenant: "Daniel Ong", property: "Sentul Residensi", unit: "A-03-09", endDate: "2026-11-09", daysLeft: 20, renewal: "in_talks" },
  { id: 305, tenant: "Nur Aisyah", property: "KLCC View Serviced", unit: "K-22-05", endDate: "2026-11-15", daysLeft: 26, renewal: "sent" },
  { id: 287, tenant: "Kevin Lau", property: "Cheras Park Homes", unit: "C-14-07", endDate: "2026-12-06", daysLeft: 47, renewal: "not_started" },
  { id: 302, tenant: "Ravi Kumar", property: "Bangsar Garden Suites", unit: "B-10-03", endDate: "2026-12-18", daysLeft: 59, renewal: "in_talks" },
];

// Open complaints, most urgent first. slaHours = remaining hours before SLA breach (negative = breached).
export const dashboardComplaints = [
  { id: "C-1182", title: "No hot water since Sunday", property: "Cheras Park Homes", unit: "C-05-11", category: "plumbing", priority: "urgent", slaHours: -2 },
  { id: "C-1179", title: "Water leak from ceiling, bathroom", property: "Sentul Residensi", unit: "A-12-03", category: "plumbing", priority: "urgent", slaHours: 3 },
  { id: "C-1175", title: "Lift B stuck between floors", property: "KLCC View Serviced", unit: "K-18-02", category: "facilities", priority: "urgent", slaHours: 5 },
  { id: "C-1171", title: "Neighbour noise after midnight", property: "Bangsar Garden Suites", unit: "B-02-06", category: "noise", priority: "high", slaHours: 22 },
  { id: "C-1168", title: "Aircon not cooling in bedroom", property: "Sentul Residensi", unit: "A-08-14", category: "electrical", priority: "high", slaHours: 30 },
  { id: "C-1164", title: "Wi-Fi drops every evening", property: "Cheras Park Homes", unit: "C-11-02", category: "other", priority: "normal", slaHours: 70 },
  { id: "C-1160", title: "Parking bay occupied by visitor", property: "Bangsar Garden Suites", unit: "B-07-01", category: "other", priority: "normal", slaHours: 96 },
];

// Recent events across the portfolio. minutesAgo is relative to MOCK_TODAY 09:45 (local time).
export const dashboardActivity = [
  { id: "a1", type: "payment", minutesAgo: 6, tenant: "Priya Nair", detail: 800, property: "Bangsar Garden Suites" },
  { id: "a2", type: "complaint", minutesAgo: 25, tenant: "Ravi Kumar", property: "Bangsar Garden Suites" },
  { id: "a3", type: "contract", minutesAgo: 64, tenant: "Ng Su Lin", property: "Sentul Residensi" },
  { id: "a4", type: "payment", minutesAgo: 118, tenant: "Kevin Lau", detail: 1600, property: "Cheras Park Homes" },
  { id: "a5", type: "bills", minutesAgo: 240, detail: 144, property: null },
  { id: "a6", type: "moveout", minutesAgo: 420, tenant: "Joseph Tan", property: "KLCC View Serviced" },
];

export const dashboardFocusItems = {
  overdueBills: 6,
  expiringContracts: 3,
  urgentComplaints: 3,
};
