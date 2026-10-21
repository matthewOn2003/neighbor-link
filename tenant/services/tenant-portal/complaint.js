import { defineApi } from "../defineApi";

export const complaintList = defineApi({ path: "/tenant-portal/complaint/list" });
export const complaintDetail = defineApi({ path: "/tenant-portal/complaint/detail" });
export const complaintCreate = defineApi({ path: "/tenant-portal/complaint/create" });
