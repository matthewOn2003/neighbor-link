"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui/Icon";
import { useLogoutMutation } from "@/store/authApi";

/** Avatar button that opens a small menu. Closes on outside click or Escape. */
export default function AccountMenu({ name, initials }) {
  const { t } = useLocale();
  const router = useRouter();
  const [logout] = useLogoutMutation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    function onPointerDown(event) {
      if (!ref.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function signOut() {
    setOpen(false);
    try {
      await logout().unwrap();
    } catch {
      // Leave the page even when the request fails; the cookie check still gates the portal.
    }
    router.replace("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={name || t("profile")}
        title={name ?? ""}
        onClick={() => setOpen((value) => !value)}
        className="grid h-9 w-9 place-items-center rounded-full border border-primary/30 bg-primary/15 text-xs font-bold text-primary transition-colors hover:bg-primary/25"
      >
        {initials}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 top-11 z-50 w-48 origin-top-right animate-scale-in rounded-2xl border border-white/10 bg-surface-container-high p-1.5 shadow-2xl shadow-black/40"
        >
          {name ? <p className="truncate px-3 py-2 text-xs font-semibold text-on-surface-variant">{name}</p> : null}
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-on-surface transition-colors hover:bg-white/[0.06]"
          >
            <Icon name="logout" className="text-[18px] text-on-surface-variant" />
            {t("sign_out")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
