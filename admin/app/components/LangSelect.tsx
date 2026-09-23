"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "@/lib/i18n";

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
        className="px-3 py-2 text-sm rounded-md font-semibold transition-colors"
        style={{ color: "var(--foreground)" }}
      >
        {localeProperties.name_short}
      </button>

      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[8rem] py-2 z-50"
          style={{
            background: "var(--panel-background)",
            border: "var(--border-width) solid var(--panel-border)",
            borderRadius: "var(--button-radius)",
            boxShadow: "var(--panel-shadow)",
          }}
        >
          {locales.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => {
                setLocale(item.code);
                setIsOpen(false);
              }}
              className="block w-full text-left px-4 py-2 text-sm transition-colors hover:opacity-70"
              style={{ color: item.code === locale ? "var(--accent)" : "var(--foreground)" }}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
