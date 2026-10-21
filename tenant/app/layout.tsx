import type { Metadata } from "next";
import ReduxProvider from "@/components/ReduxProvider";
import AppShell from "@/components/AppShell";
import { ToastProvider } from "@/components/ui";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Neighbor Link",
  description: "Tenant portal",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
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
