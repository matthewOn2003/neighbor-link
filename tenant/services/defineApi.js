import { request } from "@/services/request";

/** 定义一个接口（统一 POST）。成功返回 res.data，失败抛 ApiError。 */
export function defineApi({ path }) {
  return async function call(params = {}, { signal } = {}) {
    return request(path, params, { signal });
  };
}