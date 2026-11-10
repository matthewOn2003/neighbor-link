import type { ReactNode } from "react";
import Document from "@/components/shell/Document";

export default function RootLayout({ children }: { children: ReactNode }) {
  return <Document locale="en">{children}</Document>;
}