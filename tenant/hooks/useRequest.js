"use client";

import { useApiRequest } from "@/hooks/useApiRequest";

export function useApiRequest(path, params) {
  const { data, error, loading, reload } = useApiRequest(path, params);
  return { data, error, loading, reload };
}
