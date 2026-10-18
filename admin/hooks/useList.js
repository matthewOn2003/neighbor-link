"use client";

import { useCallback, useEffect, useState } from "react";
import { request } from "@/services/request";

const EMPTY = { key: null, list: [], total: 0, summary: null, error: null };

export function useList(path, params) {
  const paramsKey = JSON.stringify(params ?? {});
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${paramsKey}|${reloadToken}`;
  const [result, setResult] = useState(EMPTY);

  useEffect(() => {
    const controller = new AbortController();
    request(path, JSON.parse(paramsKey), { signal: controller.signal })
      .then((data) =>
        setResult({
          key: requestKey,
          list: data?.list ?? [],
          total: data?.pagination?.total ?? 0,
          summary: data?.summary ?? null,
          error: null,
        }),
      )
      .catch((err) => {
        if (err.name === "AbortError") return;
        setResult({ ...EMPTY, key: requestKey, error: err.message });
      });
    return () => controller.abort();
  }, [path, paramsKey, requestKey]);

  const reload = useCallback(() => setReloadToken((n) => n + 1), []);
  return { ...result, loading: result.key !== requestKey, paramsKey, reload };
}