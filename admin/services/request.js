export class ApiError extends Error {
  constructor({ status, code, message, errors }) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

/** 请求后端（统一 POST + JSON body）。成功返回 res.data，失败抛 ApiError。 */
export async function request(path, body = {}, { signal } = {}) {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    credentials: "include",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

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