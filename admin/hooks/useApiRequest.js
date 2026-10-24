"use client";

import { useCallback, useEffect, useState } from "react";
import { request } from "@/utils/request";

const EMPTY = { key: null, data: null, error: null };

/**
 * 进页面（或参数变化）时请求接口，返回 { data, loading, error, reload }。
 * - error 是完整的 ApiError 对象（code / message / status），没有错误时为 null。
 * - skip 为 true 时不发请求，例如要等另一个接口的结果才知道参数。
 * - reload() 用同样的参数重新请求。
 */
export function useApiRequest(path, params, { skip = false } = {}) {
  const paramsKey = JSON.stringify(params ?? {});
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${path}|${paramsKey}|${reloadToken}`;
  const [state, setState] = useState(EMPTY);

  useEffect(() => {
    if (skip) return;
    const controller = new AbortController();
    request(path, JSON.parse(paramsKey), { signal: controller.signal })
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
