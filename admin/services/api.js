// 所有后端接口路径都在这里定义。页面只引用这里的名字，不再手写路径字符串。
// 路径相对于 /api（由 hooks/useApiRequest.js 统一加前缀）。
// 所有参数（包括 id）都放在 body 里，这里只放固定路径。

export const api = {
  auth: {
    login: "/auth/login",
    logout: "/auth/logout",
    session: "/auth/session",
  },
  dictionary: {
    dropdown: "/dictionary/dropdown",
  },
  dashboard: {
    overview: "/dashboard/overview",
  },
  bill: {
    list: "/bill/list",
    activeContracts: "/bill/active-contracts",
    generate: "/bill/generate",
    create: "/bill/create",
    detail: "/bill/detail",
    update: "/bill/update",
    payment: "/bill/payment",
    void: "/bill/void",
  },
  billingSettings: {
    detail: "/billing-settings/detail",
    update: "/billing-settings/update",
  },
  contract: {
    list: "/contract/list",
    create: "/contract/create",
    detail: "/contract/detail",
    update: "/contract/update",
  },
  maintenance: {
    list: "/maintenance/list",
    create: "/maintenance/create",
    detail: "/maintenance/detail",
    update: "/maintenance/update",
  },
  payment: {
    list: "/payment/list",
  },
  paymentProof: {
    list: "/payment-proof/list",
    approve: "/payment-proof/approve",
    reject: "/payment-proof/reject",
  },
  property: {
    list: "/property/list",
    facets: "/property/facets",
    create: "/property/create",
    detail: "/property/detail",
    cover: "/property/cover/upload",
    blockList: "/property/block/list",
    blockDetail: "/property/block/detail",
    floorList: "/property/floor/list",
    floorDetail: "/property/floor/detail",
    unitList: "/property/unit/list",
    unitCreate: "/property/unit/create",
    unitUpdate: "/property/unit/update",
  },
  tenant: {
    list: "/tenant/list",
    create: "/tenant/create",
    detail: "/tenant/detail",
  },
  staffAccount: {
    list: "/staff-account/list",
    create: "/staff-account/create",
    update: "/staff-account/update",
    delete: "/staff-account/delete",
  },
  staffDepartment: {
    list: "/staff-department/list",
    create: "/staff-department/create",
    update: "/staff-department/update",
    delete: "/staff-department/delete",
  },
  staffPosition: {
    list: "/staff-position/list",
    create: "/staff-position/create",
    update: "/staff-position/update",
    delete: "/staff-position/delete",
  },
};
