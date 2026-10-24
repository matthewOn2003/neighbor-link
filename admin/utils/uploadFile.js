import { send } from "@/utils/send";

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
