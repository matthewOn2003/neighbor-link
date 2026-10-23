"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchDashboardOverview } from "@/services/dashboard/overview";

/**
 * Loads the dashboard overview for a billing cycle (YYYY-MM). An empty cycle loads the current one.
 * Changing the cycle reloads the overview.
 */
export function useDashboardOverview(cycle = "") {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const controllerRef = useRef(null);

  const load = useCallback(() => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    setError(null);
    fetchDashboardOverview({ cycle, signal: controller.signal })
      .then((result) => {
        setData(result);
      })
      .catch((err) => {
        if (err?.name === "AbortError") return;
        setError(err);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
  }, [cycle]);

  useEffect(() => {
    void Promise.resolve().then(load);
    return () => controllerRef.current?.abort();
  }, [load]);

  return { data, loading, error, reload: load };
}
