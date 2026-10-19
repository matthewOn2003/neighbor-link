import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neighbor Link | Tenant Portal",
  description: "Tenant portal for rental information, billing, and resident services.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="en"><body>{children}</body></html>;
}
