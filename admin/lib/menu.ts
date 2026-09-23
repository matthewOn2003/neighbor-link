export type MenuItem = {
  label: string;
  href: string;
};

export type MenuGroup = {
  label: string;
  href?: string;
  items: MenuItem[];
};

export const menu: MenuGroup[] = [
  { label: "Dashboard", href: "/dashboard", items: [] },
  {
    label: "Property and Tenants",
    items: [
      { label: "房屋列表", href: "/properties" },
      { label: "新建房屋", href: "/properties/new" },
      { label: "租客列表", href: "/tenants" },
      { label: "新建租客", href: "/tenants/new" },
    ],
  },
  {
    label: "Contracts",
    items: [
      { label: "合同列表", href: "/contracts" },
      { label: "新建合同", href: "/contracts/new" },
      { label: "周期性费用规则", href: "/billing-rules" },
      { label: "新建费用规则", href: "/billing-rules/new" },
    ],
  },
  {
    label: "Billing and Finance",
    items: [
      { label: "账单管理", href: "/bills" },
      { label: "创建临时费用", href: "/bills/charges/new" },
      { label: "水电录入", href: "/utility-readings" },
      { label: "新建水电录入", href: "/utility-readings/new" },
      { label: "缴费记录", href: "/payments" },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "投诉管理", href: "/complaints" },
      { label: "公告管理", href: "/announcements" },
      { label: "新建公告", href: "/announcements/new" },
      { label: "联系人维护", href: "/contacts" },
    ],
  },
  {
    label: "Administration",
    items: [
      { label: "系统设置", href: "/settings" },
      { label: "用户管理", href: "/users" },
    ],
  },
];