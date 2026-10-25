import { send } from "@/utils/send";

/** 请求后端（统一 POST + JSON body）。成功返回 res.data，失败抛 ApiError。 */
export function apiRequest(path, body = {}, { signal } = {}) {
  return send(path, {
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
