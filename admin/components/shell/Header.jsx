"use client";

import LangSelect from "@/components/LangSelect";
import { Icon } from "@/components/ui/Icon";
import { useLocale } from "@/i18n";
import { currentUser } from "@/mock/session";

export default function Header({ onMenuClick }) {
  const { t } = useLocale();
  return (
    <header className="fixed top-0 left-0 md:left-64 right-0 h-16 bg-[color:color-mix(in_srgb,var(--accent)_90%,transparent)] backdrop-blur-xl shadow z-40 flex items-center justify-between gap-3 px-4 md:px-8">
      <div className="flex items-center gap-2 min-w-0 flex-1 md:flex-none">
        <button
          type="button"
          aria-label="Menu"
          onClick={onMenuClick}
          className="md:hidden shrink-0 p-2 rounded-xl text-subtle hover:text-[#0b1c30] hover:bg-primary/10 transition-colors"
        >
          <Icon name="menu" />
        </button>
        <div className="relative flex items-center min-w-0 flex-1 md:flex-none md:w-96">
          <Icon name="search" className="absolute left-3 text-subtle" />
          <input
            className="w-full bg-primary/10 rounded-xl pl-9 pr-12 py-2 text-xs font-normal text-scene-content placeholder-text-muted outline-none focus:bg-accent transition-all"
            placeholder={t("search_placeholder")}
            type="text"
          />
          <div className="hidden md:flex absolute right-3 items-center px-2 py-0.5 rounded bg-accent text-xs font-semibold text-subtle shadow">
            ⌘K
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 md:gap-6 shrink-0">
        <button className="relative p-2 rounded-xl text-subtle hover:text-[#0b1c30] hover:bg-primary/10 transition-colors">
          <Icon name="notifications" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary-dark ring-2 ring-accent" />
        </button>
        <LangSelect />
        <div className="h-8 w-px bg-[#dce9ff]" />
        <div className="flex items-center gap-2">
          <img alt="Profile" className="w-8 h-8 rounded-full object-cover" src={currentUser.avatar} />
          <div className="hidden md:flex flex-col text-left">
            <span className="text-xs font-semibold text-scene-content">{currentUser.name}</span>
            <span className="text-xs font-semibold text-subtle">{currentUser.role}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
