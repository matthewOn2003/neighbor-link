"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { menu } from "@/config/menu";
import { useLocale } from "@/i18n";
import { Icon } from "@//components/ui/Icon";

const ACTIVE =
  "bg-primary-dark text-sm text-primary-content shadow";
const IDLE =
  "text-sm text-subtle hover:bg-primary/10 hover:text-[#0b1c30]";

export default function Sidebar({ open = false, onClose }) {
  const pathname = usePathname();
  const { t } = useLocale();

  // Hidden off-canvas below md; a drawer toggled from the header.
  const visibility = open ? "translate-x-0" : "-translate-x-full";

  return (
    <aside
      className={`fixed left-0 top-0 h-full w-64 bg-accent z-50 flex flex-col justify-between shadow overflow-hidden transition-transform duration-200 ${visibility} md:translate-x-0`}
    >
      <div className="flex flex-col">
        <Link href="/dashboard" onClick={onClose} className="flex items-center gap-2 h-16 px-6">
          <img alt="NeighborLink Logo" className="h-8 w-auto object-contain" src="/stitch/logo.png" />
          <div className="flex flex-col">
            <span className="text-lg text-scene-content font-bold">NeighborLink</span>
            <span className="text-sm text-subtle">{t("rental_ops")}</span>
          </div>
        </Link>
        <nav className="flex flex-col gap-1 px-2 pt-3">
          {menu.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={active ? "page" : undefined}
                onClick={onClose}
                className={`flex items-center gap-3 px-5 py-3 transition-all rounded-lg font-semibold ${active ? ACTIVE : IDLE}`}
              >
                <Icon name={item.icon} className="text-[20px]" />
                <span>{t(item.labelKey)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 mb-2">
        <div className="bg-primary/10 rounded-xl p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-success" />
            <span className="text-sm text-subtle">{t("system_live")}</span>
          </div>
          <span className="text-sm text-primary-dark">v2.4</span>
        </div>
      </div>
    </aside>
  );
}
