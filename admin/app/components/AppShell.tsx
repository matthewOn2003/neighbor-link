"use client";

import Topbar from "./Topbar";
import { useAppSelector } from "@/lib/store/hooks";
import { useGetSessionQuery } from "@/lib/store/authApi";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { isLoading } = useGetSessionQuery();
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);

  return (
    <>
      {!isLoading && isLoggedIn && <Topbar />}
      <main>{children}</main>
    </>
  );
}