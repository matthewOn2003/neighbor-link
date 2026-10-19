import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Neighbor Link | Tenant Portal",
  description: "Access your rental information and tenant services with Neighbor Link.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
