"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n";

export default function LangSelect() {
  const { locale, locales, setLocale, localeProperties } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-haspopup="menu" className="rounded-md px-3 py-2 text-sm font-semibold transition-colors hover:bg-black/5">
        {localeProperties.name_short}
      </button>
      {isOpen && <div role="menu" className="absolute right-0 top-full z-50 mt-2 min-w-32 rounded-lg border border-[#dce6e1] bg-white py-2 shadow-lg">
        {locales.map((item) => <button key={item.code} type="button" role="menuitem" aria-current={item.code === locale ? "true" : undefined} onClick={() => { setLocale(item.code); setIsOpen(false); }} className={`block w-full px-4 py-2 text-left text-sm transition-colors hover:bg-[#f4f7f5] ${item.code === locale ? "font-semibold text-[#315b4c]" : "text-[#18322e]"}`}>{item.name}</button>)}
      </div>}
    </div>
  );
}
