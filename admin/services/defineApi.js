export class ApiError extends Error {
  constructor({ status, code, message, errors }) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

const clean = (obj = {}) =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== ""));

/** 定义一个接口。成功返回 res.data，失败抛 ApiError。 */
export function defineApi({ method = "GET", path }) {
  return async function call(params = {}, { signal } = {}) {
    const isGet = method === "GET";
    const qs = isGet ? new URLSearchParams(clean(params)).toString() : "";

    const res = await fetch(`/api${path}${qs ? `?${qs}` : ""}`, {
      method,
      credentials: "include",
      signal,
      headers: isGet ? undefined : { "Content-Type": "application/json" },
      body: isGet ? undefined : JSON.stringify(params),
    });

    const body = await res.json().catch(() => null);
    if (!res.ok) {
      throw new ApiError({
        status: res.status,
        code: body?.error?.code ?? body?.code ?? "UNKNOWN",
        message: body?.error?.message ?? body?.message ?? `HTTP ${res.status}`,
        errors: body?.errors,
      });
    }
    return body?.data ?? null;
  };
}