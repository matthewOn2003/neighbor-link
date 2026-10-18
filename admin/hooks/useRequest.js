"use client";

import { useApiRequest } from "@/hooks/useApiRequest";

export function useRequest(path, params) {
  const { data, error, loading } = useApiRequest(path, params);
  return { data, error, loading };
}
