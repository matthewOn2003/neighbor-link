"use client";

import { useMemo } from "react";
import { useRequest } from "@/hooks/useRequest";

// 没有单条详情接口，编辑页通过列表接口按 id 查找记录
export function useStaffRecord(path, id) {
  const { data, loading, error } = useRequest(path, { per_page: 100 });
  const record = useMemo(
    () => (data?.list ?? []).find((item) => String(item.id) === String(id)) ?? null,
    [data, id],
  );
  return { record, loading, error };
}
