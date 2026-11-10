import type { ReactNode } from "react";
import Document from "@/components/shell/Document";
import { getRequestLocale } from "@/i18n/request";

export default async function RootLayout({ children }: { children: ReactNode }) {
  return <Document locale={await getRequestLocale()}>{children}</Document>;
}
