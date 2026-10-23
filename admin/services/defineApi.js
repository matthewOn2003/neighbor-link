import { request } from "@/services/request";

export function defineApi({ path }) {
  return async function call(params = {}, { signal } = {}) {
    return request(path, params, { signal });
  };
}