"use client";

import { Link } from "@/i18n/navigation";
import { menu } from "@/config/menu";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/i18n";

export default function BottomNav({ activeKey }) {
  const { t } = useLocale();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 bg-background/85 pb-safe backdrop-blur-2xl border-t border-white/[0.06]">
      <div className="mx-auto grid h-16 max-w-lg grid-cols-4 items-center px-2">
        {menu.map((item) => {
          const active = item.key === activeKey;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-1 transition-colors ${active ? "text-primary" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              <span className={`flex h-8 w-10 items-center justify-center rounded-full transition-all duration-300 ${active ? "scale-110 bg-primary/10" : "scale-100"}`}>
                <Icon name={item.icon} className={`text-[22px] ${active ? "fill-1" : ""}`} />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider">{t(item.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
