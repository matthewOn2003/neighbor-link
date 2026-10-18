"use client";

import { useApiRequest } from "@/hooks/useApiRequest";

export function useList(path, params) {
  const { data, error, loading, paramsKey, reload } = useApiRequest(path, params);
  return {
    list: data?.list ?? [],
    total: data?.pagination?.total ?? 0,
    summary: data?.summary ?? null,
    error,
    loading,
    paramsKey,
    reload,
  };
}
