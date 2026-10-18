"use client";

import { useCallback, useEffect, useState } from "react";
import { request } from "@/services/request";

const EMPTY = { key: null, data: null, error: null };

export function useApiRequest(path, params) {
  const paramsKey = JSON.stringify(params ?? {});
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = paramsKey + "|" + reloadToken;
  const [state, setState] = useState(EMPTY);

  useEffect(() => {
    const controller = new AbortController();
    request(path, JSON.parse(paramsKey), { signal: controller.signal })
      .then((data) => setState({ key: requestKey, data, error: null }))
      .catch((err) => {
        if (err.name !== "AbortError") {
          setState({ key: requestKey, data: null, error: err.message });
        }
      });
    return () => controller.abort();
  }, [path, paramsKey, requestKey]);

  const reload = useCallback(() => setReloadToken((current) => current + 1), []);

  return {
    data: state.data,
    error: state.error,
    loading: state.key !== requestKey,
    paramsKey,
    reload,
  };
}
