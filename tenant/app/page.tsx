"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale } from "@/i18n";
import { useLoginMutation } from "@/store/authApi";
import LangSelect from "@/components/LangSelect";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui";

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string") {
      return (data as { error: string }).error;
    }
  }
  return undefined;
}

type LoginFields = { username: string; password: string };

export default function Home() {
  const router = useRouter();
  const [login] = useLoginMutation();
  const { t } = useLocale();
  const [form, setForm] = useState<LoginFields>({ username: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<LoginFields>>({});
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  function updateField(key: keyof LoginFields) {
    return (value: string) => {
      setForm((current) => ({ ...current, [key]: value }));
      setFieldErrors((current) => ({ ...current, [key]: undefined }));
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: Partial<LoginFields> = {};
    if (!form.username.trim()) nextErrors.username = t("field_required");
    if (!form.password) nextErrors.password = t("field_required");
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setError("");
    setIsLoading(true);

    try {
      await login({ username: form.username, password: form.password, role: "tenant" }).unwrap();
      router.push("/dashboard");
    } catch (submitError) {
      setError(getErrorMessage(submitError) ?? t("login_failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 font-sans text-on-surface antialiased selection:bg-primary-container selection:text-white">
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute right-4 top-4 z-10">
        <LangSelect />
      </div>

      <main className="relative w-full max-w-sm">
        <div className="glass-panel animate-fade-up rounded-3xl p-7">
          <div className="flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-gradient-to-br from-surface-container-high to-surface-container-low p-2.5 shadow-inner">
              <Image src="/stitch/logo.png" alt={t("brand_name")} width={44} height={44} className="h-full w-full object-contain" priority />
            </div>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">NeighborLink</p>
            <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-on-surface">{t("portal_login_title")}</h1>
            <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">{t("portal_login_subtitle")}</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
            <Field label={t("username")} icon="person" error={fieldErrors.username}>
              <Input
                name="username"
                label={t("username")}
                value={form.username}
                onChange={updateField("username")}
                error={fieldErrors.username}
                autoComplete="username"
                icon="person"
              />
            </Field>
            <Field label={t("password")} icon="lock" error={fieldErrors.password}>
              <Input
                name="password"
                label={t("password")}
                type="password"
                value={form.password}
                onChange={updateField("password")}
                error={fieldErrors.password}
                autoComplete="current-password"
                icon="lock"
              />
            </Field>

            {error ? (
              <p key={error} role="alert" className="animate-shake rounded-xl border border-rose-500/25 bg-rose-950/40 px-3 py-2 text-xs text-rose-200">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 flex items-center justify-center gap-2 rounded-2xl bg-primary-container py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-container/30 transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {isLoading ? t("signing_in") : t("sign_in")}
              {isLoading ? null : <Icon name="arrow_forward" className="text-[18px]" />}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-on-surface-variant">{t("portal_login_help")}</p>
      </main>
    </div>
  );
}

function Field({ label, icon, error, children }: { label: string; icon: string; error?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[11px] font-semibold text-on-surface-variant">{label}</span>
      <span className="relative">
        <Icon name={icon} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant" />
        {children}
      </span>
      {error ? <span className="text-[11px] text-rose-300">{error}</span> : null}
    </label>
  );
}
