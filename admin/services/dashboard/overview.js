import {
  MOCK_TODAY,
  dashboardActivity,
  dashboardCollectionFunnel,
  dashboardComplaints,
  dashboardExpiringContracts,
  dashboardFocusItems,
  dashboardPriorityBills,
  dashboardProperties,
  dashboardRevenueSeries,
  dashboardSummary,
} from "@/mock/dashboard";

// Set to false once the backend exposes `POST /api/dashboard/overview` (via the Next.js proxy).
const USE_MOCK = true;

const MOCK_LATENCY_MS = 350;

function buildMockOverview() {
  return {
    summary: dashboardSummary,
    focus: dashboardFocusItems,
    properties: dashboardProperties,
    revenue: dashboardRevenueSeries,
    collectionFunnel: dashboardCollectionFunnel,
    priorityBills: dashboardPriorityBills,
    expiringContracts: dashboardExpiringContracts,
    complaints: dashboardComplaints,
    activity: dashboardActivity,
    today: MOCK_TODAY,
    generatedAt: "2026-10-20T09:45:00+08:00",
  };
}

/**
 * Loads everything the admin dashboard needs in one round trip.
 * Resolves with the overview payload; rejects with an Error on failure.
 */
export async function fetchDashboardOverview({ signal } = {}) {
  if (USE_MOCK) {
    await new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, MOCK_LATENCY_MS);
      signal?.addEventListener("abort", () => {
        clearTimeout(timer);
        reject(new DOMException("Aborted", "AbortError"));
      });
    });
    return buildMockOverview();
  }

  const { request } = await import("@/services/request");
  return request("/dashboard/overview", {}, { signal });
}
