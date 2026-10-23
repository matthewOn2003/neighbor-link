import { request } from "@/services/request";

/**
 * Loads everything the admin dashboard needs in one round trip.
 * cycle is an optional billing cycle in YYYY-MM form; the server reports the current cycle when omitted.
 * Resolves with the overview payload; rejects with an ApiError on failure.
 */
export async function fetchDashboardOverview({ cycle, signal } = {}) {
  return request("/dashboard/overview", cycle ? { cycle } : {}, { signal });
}
