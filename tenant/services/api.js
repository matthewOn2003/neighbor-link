// 所有后端接口路径都在这里定义。页面只引用这里的名字，不再手写路径字符串。
// 路径相对于 /api（由 hooks/useApiRequest.js 统一加前缀）。
// 所有参数（包括 id）都放在 body 里，这里只放固定路径。

export const api = {
  dictionary: {
    dropdown: "/dictionary/dropdown",
  },
  portal: {
    me: "/tenant-portal/me",
    home: "/tenant-portal/home",
    wifi: "/tenant-portal/wifi",
    announcementList: "/tenant-portal/announcement/list",
  },
  bill: {
    list: "/tenant-portal/bills",
    detail: "/tenant-portal/bills/detail",
  },
  notification: {
    list: "/tenant-portal/notification/list",
    read: "/tenant-portal/notification/read",
  },
  paymentProof: {
    list: "/tenant-portal/payment-proof/list",
    create: "/tenant-portal/payment-proof/create",
  },
  maintenance: {
    list: "/tenant-portal/maintenance/list",
    detail: "/tenant-portal/maintenance/detail",
    create: "/tenant-portal/maintenance/create",
  },
  complaint: {
    list: "/tenant-portal/complaint/list",
    detail: "/tenant-portal/complaint/detail",
    create: "/tenant-portal/complaint/create",
  },
};
