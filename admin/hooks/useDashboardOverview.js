"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchDashboardOverview } from "@/services/dashboard/overview";

export function useDashboardOverview() {
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
    fetchDashboardOverview({ signal: controller.signal })
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
  }, []);

  useEffect(() => {
    void Promise.resolve().then(load);
    return () => controllerRef.current?.abort();
  }, [load]);

  return { data, loading, error, reload: load };
}
