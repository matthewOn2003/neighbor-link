"use client";

import { useCallback, useEffect, useState } from "react";
import { apiRequest } from "@/utils/apiRequest";

const EMPTY = { key: null, data: null, error: null };

/**
 * Enter a page (or when parameters change) and request the API, returning { data, loading, error, reload }.
 * - error is the complete ApiError object (code / message / status), or null if no error.
 * - skip is true to not send the request, e.g., when waiting for another API result to determine the parameters.
 * - reload() re-requests with the same parameters.
 */
export function useApiData(path, params, { skip = false } = {}) {
  const paramsKey = JSON.stringify(params ?? {});
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${path}|${paramsKey}|${reloadToken}`;
  const [state, setState] = useState(EMPTY);

  useEffect(() => {
    if (skip) return;
    const controller = new AbortController();
    apiRequest(path, JSON.parse(paramsKey), { signal: controller.signal })
      .then((data) => setState({ key: requestKey, data, error: null }))
      .catch((error) => {
        if (error.name !== "AbortError") setState({ key: requestKey, data: null, error });
      });
    return () => controller.abort();
  }, [path, paramsKey, requestKey, skip]);

  const reload = useCallback(() => setReloadToken((current) => current + 1), []);

  const settled = !skip && state.key === requestKey;
  return {
    data: skip ? null : state.data,
    error: settled ? state.error : null,
    loading: !skip && !settled,
    paramsKey,
    reload,
  };
}
