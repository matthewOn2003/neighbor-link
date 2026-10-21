"use client";

import { usePathname } from "@/i18n/navigation";
import PortalHeader from "./shell/PortalHeader";
import BottomNav from "./shell/BottomNav";
import { activeTabFor } from "@/config/menu";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // The login page renders without the app chrome.
  if (pathname === "/") return <>{children}</>;

  const tab = activeTabFor(pathname);
  return (
    <div className="min-h-screen bg-background font-sans text-on-surface antialiased selection:bg-primary-container selection:text-white">
      <PortalHeader />
      <main className="relative z-10 mx-auto w-full max-w-lg px-4 pb-32 pt-20">{children}</main>
      <BottomNav activeKey={tab.key} />
    </div>
  );
}
