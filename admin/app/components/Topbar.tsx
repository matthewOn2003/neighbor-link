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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { localeProperties } = useLocale();
  const [logout] = useLogoutMutation();
  const text = localeProperties.messages;

  async function handleLogout() {
    setDrawerOpen(false);
    await logout();
    router.push("/");
  }

  // Close dropdown and drawer when the route changes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    if (openIndex !== null) setOpenIndex(null);
    if (drawerOpen) setDrawerOpen(false);
  }

  // Desktop dropdown: click outside to close.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Drawer: Esc to close, and lock page scroll while open.
  useEffect(() => {
    if (!drawerOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [drawerOpen]);

  return (
    <>
      <header
        ref={containerRef}
        className="flex justify-center shadow"
        style={{
          height: "var(--topbar-height)",
          borderColor: "var(--line)",
          background: "var(--panel-background)",
        }}
      >
        <div className="content-container relative flex items-center justify-between">
          {/* Left: logo */}
          <div className="flex items-center shrink-0">
            <Link href="/dashboard" className="font-semibold text-lg" style={{ color: "var(--foreground)" }}>
              <img
                src="/neighbor-link-logo.svg"
                alt={text.eyebrow}
                style={{ width: 160, height: "auto" }}
              />
            </Link>
          </div>

          {/* Center: desktop menu */}
          <nav className="hidden md:flex items-center gap-4">
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
                        ? "var(--primary)"
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
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="px-3 py-2 text-sm rounded-md font-semibold flex items-center gap-1 transition-colors"
                    style={{ color: "var(--foreground)" }}
                  >
                    {group.label}
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
                            color: pathname === item.href ? "var(--primary)" : "var(--foreground)",
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

          {/* Right: desktop language / sign out */}
          <div className="hidden md:flex items-center gap-2 shrink-0">
            <LangSelect />
            <button
              type="button"
              onClick={handleLogout}
              className="px-3 py-2 text-sm rounded-md font-semibold transition-colors"
              style={{ color: "var(--foreground)" }}
            >
              {text.signOut}
            </button>
          </div>

          {/* Right: mobile hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-md"
            style={{ color: "var(--foreground)" }}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
            onClick={() => setDrawerOpen(true)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile drawer (rendered outside <header> so it is never clipped) */}
      <div className="md:hidden">
        {/* Overlay */}
        <div
          onClick={() => setDrawerOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40"
          style={{
            background: "rgba(0, 0, 0, 0.45)",
            opacity: drawerOpen ? 1 : 0,
            pointerEvents: drawerOpen ? "auto" : "none",
            transition: "opacity 0.25s ease",
          }}
        />

        {/* Panel */}
        <aside
          id="mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-hidden={!drawerOpen}
          className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
          style={{
            width: "80%",
            maxWidth: "20rem",
            background: "var(--panel-background)",
            boxShadow: "var(--panel-shadow)",
            paddingTop: "env(safe-area-inset-top, 0px)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)",
            transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
            visibility: drawerOpen ? "visible" : "hidden",
            transition: drawerOpen
              ? "transform 0.25s ease"
              : "transform 0.25s ease, visibility 0s linear 0.25s",
          }}
        >
          {/* Drawer header */}
          <div
            className="flex items-center justify-between px-4 shrink-0"
            style={{ height: "var(--topbar-height)", borderBottom: "1px solid var(--line)" }}
          >
            <LangSelect />
            <button
              type="button"
              className="p-2 rounded-md"
              style={{ color: "var(--foreground)" }}
              aria-label="Close menu"
              onClick={() => setDrawerOpen(false)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="5" y1="5" x2="19" y2="19" />
                <line x1="19" y1="5" x2="5" y2="19" />
              </svg>
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto py-2">
            {menu.map((group) => {
              if (group.href) {
                const active = pathname.startsWith(group.href);
                return (
                  <Link
                    key={group.label}
                    href={group.href}
                    className="block px-5 py-3 text-sm font-semibold"
                    style={{ color: active ? "var(--primary)" : "var(--foreground)" }}
                  >
                    {group.label}
                  </Link>
                );
              }

              return (
                <div key={group.label} className="py-1">
                  <div
                    className="px-5 pt-3 pb-1 text-xs font-semibold uppercase"
                    style={{ color: "var(--ink-muted)", letterSpacing: "0.04em" }}
                  >
                    {group.label}
                  </div>
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-5 py-3 text-sm"
                      style={{ color: pathname === item.href ? "var(--primary)" : "var(--foreground)" }}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              );
            })}
          </nav>

          {/* Footer: sign out */}
          <div className="p-4 shrink-0" style={{ borderTop: "1px solid var(--line)" }}>
            <button type="button" onClick={handleLogout} className="btn btn-secondary" style={{ width: "100%" }}>
              {text.signOut}
            </button>
          </div>
        </aside>
      </div>
    </>
  );
}