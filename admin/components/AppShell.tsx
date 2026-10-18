"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./shell/Sidebar";
import Header from "./shell/Header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The login page renders without the admin chrome.
  if (pathname === "/") return <>{children}</>;

  return (
    <div className="bg-[#f8fafc] text-scene-content antialiased min-h-screen">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="relative w-full pt-16 bg-[#f8fafc] min-h-screen">{children}</main>
      </div>
    </div>
  );
}
