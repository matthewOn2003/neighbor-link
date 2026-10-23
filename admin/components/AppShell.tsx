"use client";

import { useState } from "react";
import { usePathname } from "@/i18n/navigation";
import Sidebar from "./shell/Sidebar";
import Header from "./shell/Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Mobile drawer state; the sidebar is always visible from md up.
  // The drawer is tied to the path it was opened on, so navigating closes it.
  const [navState, setNavState] = useState({ open: false, path: pathname });
  const navOpen = navState.open && navState.path === pathname;
  const setNavOpen = (open: boolean) => setNavState({ open, path: pathname });

  // The login page renders without the admin chrome.
  if (pathname === "/") return <>{children}</>;

  return (
    <div className="bg-scene text-scene-content antialiased min-h-screen">
      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      {navOpen ? (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setNavOpen(false)}
        />
      ) : null}
      <div className="md:pl-64">
        <Header onMenuClick={() => setNavOpen(!navOpen)} />
        <main className="relative w-full pt-16 bg-scene min-h-screen">{children}</main>
      </div>
    </div>
  );
}
