import { defineApi } from "../defineApi";
import { postForm } from "./multipart";

export const maintenanceList = defineApi({ path: "/tenant-portal/maintenance/list" });
export const maintenanceDetail = defineApi({ path: "/tenant-portal/maintenance/detail" });

/** Submit a repair request with optional photos (multipart). Returns the created request with its photos. */
export function maintenanceCreate({ title, description, category, priority, files = [] }) {
  const form = new FormData();
  form.append("title", title);
  form.append("description", description ?? "");
  form.append("category", category);
  form.append("priority", priority);
  for (const file of files) form.append("files", file);
  return postForm("/tenant-portal/maintenance/create", form);
}
