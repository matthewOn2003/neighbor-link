import type { ReactNode } from "react";
import type { Locale } from "@/i18n";
import "@/styles/globals.css";

// Same font setup as the admin and tenant apps: Inter and Material Symbols.
export default function Document({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <html lang={locale === "zh" ? "zh-Hans" : "en"}>
      {/* eslint-disable-next-line @next/next/no-head-element */}
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {/* eslint-disable-next-line @next/next/no-page-custom-font, @next/next/google-font-display */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=block"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
