// The tenant portal has four tabs. Each tab owns the routes listed in `paths`.
export const menu = [
  {
    key: "dashboard",
    labelKey: "portal_nav_home",
    href: "/dashboard",
    icon: "home",
    subtitleKey: "portal_header_home",
    paths: ["/dashboard"],
  },
  {
    key: "billing",
    labelKey: "portal_nav_billing",
    href: "/billing",
    icon: "receipt_long",
    subtitleKey: "portal_header_billing",
    paths: ["/billing"],
  },
  {
    key: "services",
    labelKey: "portal_nav_services",
    href: "/services",
    icon: "build",
    subtitleKey: "portal_header_services",
    paths: ["/services", "/maintenance", "/complaints"],
  },
  {
    key: "my-home",
    labelKey: "portal_nav_my_home",
    href: "/my-home",
    icon: "apartment",
    subtitleKey: "portal_header_my_home",
    paths: ["/my-home"],
  },
];

/** The tab whose routes contain the given pathname (without locale prefix). */
export function activeTabFor(pathname) {
  return (
    menu.find((item) => item.paths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) ?? menu[0]
  );
}
