"use client";

import { useEffect, useState } from "react";
import { request } from "@/services/request";

export function useRequest(path, params) {
  const paramsKey = JSON.stringify(params ?? {});
  const [state, setState] = useState({ key: null, data: null, error: null });

  useEffect(() => {
    const controller = new AbortController();
    request(path, JSON.parse(paramsKey), { signal: controller.signal })
      .then((data) => setState({ key: paramsKey, data, error: null }))
      .catch((err) => {
        if (err.name !== "AbortError") setState({ key: paramsKey, data: null, error: err.message });
      });
    return () => controller.abort();
  }, [path, paramsKey]);

  return { data: state.data, error: state.error, loading: state.key !== paramsKey };
}