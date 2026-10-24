import { ApiError } from "@/utils/ApiError";

/** 请求后端并统一处理响应：成功返回 res.data，失败抛 ApiError。request 和 uploadFile 共用。 */
export async function send(path, init) {
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
