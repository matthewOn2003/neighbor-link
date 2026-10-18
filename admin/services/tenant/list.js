import { defineApi } from "../defineApi";
export const tenantList = defineApi({ method: "GET", path: "/tenant/list" });