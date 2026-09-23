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
      <button type="button" className="locale-switch" onClick={() => setIsOpen((open) => !open)}>
        {localeProperties.name_short}
      </button>

      {isOpen && (
        <div className="locale-dropdown">
          {locales.map((item) => (
            <button
              key={item.code}
              type="button"
              className="locale-dropdown-item"
              data-active={item.code === locale}
              onClick={() => {
                setLocale(item.code);
                setIsOpen(false);
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
