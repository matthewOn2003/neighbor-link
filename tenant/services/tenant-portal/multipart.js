import { ApiError } from "../request";

/** POST a multipart form to a tenant portal endpoint. Returns res.data, or throws ApiError. */
export async function postForm(path, form) {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError({
      status: res.status,
      code: data?.error?.code ?? "UNKNOWN",
      message: data?.error?.message ?? `HTTP ${res.status}`,
    });
  }
  return data?.data ?? null;
}
