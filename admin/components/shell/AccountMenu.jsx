"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "@/i18n";
import { Icon } from "@/components/ui";
import { useLogoutMutation } from "@/store/authApi";

/** Avatar button that opens a small menu. Closes on outside click or Escape. */
export default function AccountMenu({ name, avatar }) {
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
      // Leave the console even when the request fails; the session check still gates the pages.
    }
    router.replace("/");
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("profile")}
        onClick={() => setOpen((value) => !value)}
        className="rounded-full ring-offset-2 ring-offset-accent transition-shadow hover:ring-2 hover:ring-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
      >
        {avatar ? (
          <img alt={name ?? t("profile")} className="h-8 w-8 rounded-full object-cover" src={avatar} />
        ) : (
          <span className="grid h-8 w-8 place-items-center rounded-full bg-scene text-xs font-semibold text-primary">
            {(name ?? "?").slice(0, 1).toUpperCase()}
          </span>
        )}
      </button>
      {open ? (
        <div role="menu" className="absolute right-0 top-11 z-50 w-48 rounded-2xl border border-white/10 bg-surface-container-high p-1.5 shadow-2xl shadow-black/40">
          {name ? <p className="truncate px-3 py-2 text-xs font-semibold text-subtle">{name}</p> : null}
          <button
            type="button"
            role="menuitem"
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-scene-content transition-colors hover:bg-primary/10"
          >
            <Icon name="logout" className="text-[18px] text-subtle" />
            {t("sign_out")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
