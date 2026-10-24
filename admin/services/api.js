// 所有后端接口路径都在这里定义。页面只引用这里的名字，不再手写路径字符串。
// 路径相对于 /api（由 services/request.js 统一加前缀）。
// 带 id 等参数的接口写成函数。

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
    detail: (id) => `/bill/detail/${id}`,
    update: (id) => `/bill/update/${id}`,
    payment: (id) => `/bill/payment/${id}`,
    void: (id) => `/bill/void/${id}`,
  },
  billingSettings: {
    detail: "/billing-settings/detail",
    update: "/billing-settings/update",
  },
  contract: {
    list: "/contract/list",
    create: "/contract/create",
    detail: (id) => `/contract/detail/${id}`,
    update: (id) => `/contract/update/${id}`,
  },
  maintenance: {
    list: "/maintenance/list",
    create: "/maintenance/create",
    detail: (id) => `/maintenance/detail/${id}`,
    update: (id) => `/maintenance/update/${id}`,
  },
  payment: {
    list: "/payment/list",
  },
  paymentProof: {
    list: "/payment-proof/list",
    review: (action, id) => `/payment-proof/${action}/${id}`,
  },
  property: {
    list: "/property/list",
    facets: "/property/facets",
    create: "/property/create",
    detail: (id) => `/property/detail/${id}`,
    cover: (id) => `/property/cover/upload/${id}`,
    blockList: "/property/block/list",
    blockDetail: (id) => `/property/block/${id}`,
    floorList: "/property/floor/list",
    floorDetail: (id) => `/property/floor/${id}`,
    unitList: "/property/unit/list",
    unitCreate: "/property/unit/create",
    unitUpdate: (id) => `/property/unit/update/${id}`,
  },
  tenant: {
    list: "/tenant/list",
    create: "/tenant/create",
    detail: (id) => `/tenant/detail/${id}`,
  },
  staffAccount: {
    list: "/staff-account/list",
    create: "/staff-account/create",
    update: (id) => `/staff-account/update/${id}`,
    delete: (id) => `/staff-account/delete/${id}`,
  },
  staffDepartment: {
    list: "/staff-department/list",
    create: "/staff-department/create",
    update: (id) => `/staff-department/update/${id}`,
    delete: (id) => `/staff-department/delete/${id}`,
  },
  staffPosition: {
    list: "/staff-position/list",
    create: "/staff-position/create",
    update: (id) => `/staff-position/update/${id}`,
    delete: (id) => `/staff-position/delete/${id}`,
  },
};
