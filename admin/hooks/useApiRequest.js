"use client";

import { useCallback, useEffect, useState } from "react";

export class ApiError extends Error {
  constructor({ status, code, message, errors }) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

async function send(path, init) {
  const res = await fetch(`/api${path}`, { method: "POST", credentials: "include", ...init });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      code: data?.error?.code ?? data?.code ?? "UNKNOWN",
      message: data?.error?.message ?? data?.message ?? `HTTP ${res.status}`,
      errors: data?.errors,
    });
  }
  return data?.data ?? null;
}

/** 请求后端（统一 POST + JSON body）。成功返回 res.data，失败抛 ApiError。 */
export function request(path, body = {}, { signal } = {}) {
  return send(path, {
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/**
 * 上传文件（multipart）。file 可以是单个文件或文件数组，字段名默认 "file"（多文件时用 fieldName 指定，如 "files"）。
 * 其他参数（如 id）通过 fields 传入。成功返回 res.data，失败抛 ApiError。
 */
export function uploadFile(path, file, { signal, fields = {}, fieldName = "file" } = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields)) form.append(key, String(value ?? ""));
  for (const item of [file].flat().filter(Boolean)) form.append(fieldName, item);
  return send(path, { signal, body: form });
}

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
