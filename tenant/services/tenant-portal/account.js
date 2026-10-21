import { defineApi } from "../defineApi";

export const tenantMe = defineApi({ path: "/tenant-portal/me" });
export const tenantBills = defineApi({ path: "/tenant-portal/bills" });
export const tenantWifi = defineApi({ path: "/tenant-portal/wifi" });
