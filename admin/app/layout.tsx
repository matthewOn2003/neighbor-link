import type { Metadata } from "next";
import ReduxProvider from "@/app/components/ReduxProvider";
import AppShell from "@/app/components/AppShell";
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
          <AppShell>{children}</AppShell>
        </ReduxProvider>
      </body>
    </html>
  );
}