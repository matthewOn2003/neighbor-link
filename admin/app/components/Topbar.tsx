"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { menu } from "@/lib/menu";
import { useLocale } from "@/lib/i18n";
import { useLogoutMutation } from "@/lib/store/authApi";
import LangSelect from "./LangSelect";

export default function Topbar() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { localeProperties } = useLocale();
  const [logout] = useLogoutMutation();

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  // 官方推荐写法：用 state 存上一次的值，在 render 阶段比较并调整
  // 不能用 ref，因为 render 阶段不允许读 ref.current
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (openIndex !== null) {
      setOpenIndex(null);
    }
  }

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      ref={containerRef}
      className="relative flex items-center justify-between border-b"
      style={{
        height: "var(--topbar-height)",
        borderColor: "var(--line)",
        background: "var(--panel-background)",
        paddingInline: "var(--page-padding-inline)",
      }}
    >
      {/* 左：Logo */}
      <div className="flex items-center shrink-0">
        <Link
          href="/dashboard"
          className="font-semibold text-lg"
          style={{ color: "var(--foreground)" }}
        >
          Neighbor Link
        </Link>
      </div>

      {/* 中：菜单组 */}
      <nav className="flex items-center gap-4">
        {menu.map((group, index) => {
          const isSingleLink = !!group.href;
          const isOpen = openIndex === index;

          if (isSingleLink) {
            return (
              <Link
                key={group.label}
                href={group.href as string}
                className="px-3 py-2 text-sm rounded-md font-semibold transition-colors"
                style={{
                  color: pathname.startsWith(group.href as string)
                    ? "var(--accent)"
                    : "var(--foreground)",
                }}
              >
                {group.label}
              </Link>
            );
          }

          return (
            <div key={group.label} className="relative">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="px-3 py-2 text-sm rounded-md font-semibold flex items-center gap-1 transition-colors"
                style={{ color: "var(--foreground)" }}
              >
                {group.label}
                {/* <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  className="transition-transform"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg> */}
              </button>

              {isOpen && (
                <div
                  className="absolute left-0 top-full mt-2 min-w-[12rem] py-2 z-50"
                  style={{
                    background: "var(--panel-background)",
                    border: "var(--border-width) solid var(--panel-border)",
                    borderRadius: "var(--button-radius)",
                    boxShadow: "var(--panel-shadow)",
                  }}
                >
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-4 py-2 text-sm transition-colors hover:opacity-70"
                      style={{
                        color: pathname === item.href ? "var(--accent)" : "var(--foreground)",
                      }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* 右：语言/主题/登出 */}
      <div className="flex items-center gap-2 shrink-0">
        <LangSelect />
        <button
          type="button"
          onClick={handleLogout}
          className="px-3 py-2 text-sm rounded-md font-semibold transition-colors"
          style={{ color: "var(--foreground)" }}
        >
          {localeProperties.messages.signOut}
        </button>
      </div>
    </header>
  );
}