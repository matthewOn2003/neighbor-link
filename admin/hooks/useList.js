"use client";

import { useApiData } from "@/hooks/useApiData";

export function useList(path, params) {
  const { data, error, loading, paramsKey, reload } = useApiData(path, params);
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
