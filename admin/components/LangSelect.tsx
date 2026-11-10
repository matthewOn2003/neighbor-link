"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/i18n";

export default function LangSelect() {
  const { locale, locales, setLocale, localeProperties } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className="btn btn-ghost"
      >
        {localeProperties.name_short}
      </button>

      {isOpen && (
        <div role="listbox" className="absolute right-0 top-full mt-2 min-w-[8rem] p-1 z-50 flex flex-col gap-0.5 rounded-xl border border-line bg-accent shadow-lg">
          {locales.map((item) => (
            <button
              key={item.code}
              type="button"
              role="option"
              aria-selected={item.code === locale}
              onClick={() => {
                setLocale(item.code);
                setIsOpen(false);
              }}
              className={`block w-full text-left rounded-lg px-3 py-2 text-sm transition-colors hover:bg-primary/10 ${
                item.code === locale ? "text-primary font-semibold" : "text-scene-content"
              }`}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
