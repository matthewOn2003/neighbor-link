import { defineApi } from "../defineApi";

export const notificationList = defineApi({ path: "/tenant-portal/notification/list" });
export const notificationRead = defineApi({ path: "/tenant-portal/notification/read" });
