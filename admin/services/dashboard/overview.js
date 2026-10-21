import { request } from "@/services/request";

/**
 * Loads everything the admin dashboard needs in one round trip.
 * Resolves with the overview payload; rejects with an ApiError on failure.
 */
export async function fetchDashboardOverview({ signal } = {}) {
  return request("/dashboard/overview", {}, { signal });
}
