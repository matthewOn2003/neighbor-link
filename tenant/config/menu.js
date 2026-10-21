// The tenant portal has four tabs. Each tab owns the routes listed in `paths`.
export const menu = [
  {
    key: "dashboard",
    labelKey: "portal_nav_home",
    href: "/dashboard",
    icon: "home",
    paths: ["/dashboard"],
  },
  {
    key: "billing",
    labelKey: "portal_nav_billing",
    href: "/billing",
    icon: "receipt_long",
    paths: ["/billing"],
  },
  {
    key: "services",
    labelKey: "portal_nav_services",
    href: "/services",
    icon: "build",
    paths: ["/services", "/maintenance", "/complaints"],
  },
  {
    key: "my-home",
    labelKey: "portal_nav_my_home",
    href: "/my-home",
    icon: "apartment",
    paths: ["/my-home"],
  },
];

/** The tab whose routes contain the given pathname (without locale prefix). */
export function activeTabFor(pathname) {
  return (
    menu.find((item) => item.paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) ?? menu[0]
  );
}
