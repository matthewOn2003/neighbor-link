import { defineApi } from "../defineApi";

export const maintenanceList = defineApi({ path: "/tenant-portal/maintenance/list" });
export const maintenanceDetail = defineApi({ path: "/tenant-portal/maintenance/detail" });
export const maintenanceCreate = defineApi({ path: "/tenant-portal/maintenance/create" });
