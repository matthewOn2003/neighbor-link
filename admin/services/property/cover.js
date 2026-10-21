import { ApiError } from "@/services/request";

/** 上传属性封面图（multipart，字段名 file）。成功返回更新后的属性详情，失败抛 ApiError。 */
export async function uploadPropertyCover(id, file) {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`/api/property/cover/upload/${id}`, {
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
