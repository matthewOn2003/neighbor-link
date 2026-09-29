import type { Metadata } from "next";
import ReduxProvider from "@/app/components/ReduxProvider";
import AppShell from "@/app/components/AppShell";
import { ToastProvider } from "@/app/components/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neighbor Link Admin",
  description: "Administrative portal",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <ToastProvider>
            <AppShell>{children}</AppShell>
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}