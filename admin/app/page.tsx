"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale } from "@/i18n";
import { useLoginMutation } from "@/store/authApi";
import LangSelect from "@/components/LangSelect";
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

  async function handleSubmit() {
    const nextErrors: Partial<LoginFields> = {};
    if (!form.username.trim()) nextErrors.username = t("field_required");
    if (!form.password) nextErrors.password = t("field_required");
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setError("");
    setIsLoading(true);

    try {
      await login({ username: form.username, password: form.password, role: "admin" }).unwrap();
      router.push("/dashboard");
    } catch (submitError) {
      setError(getErrorMessage(submitError) ?? t("login_failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-[url('/login-bg.jpg')] bg-cover bg-center">
      <section className="panel w-full max-w-md">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Image src="/brand/logo.png" alt="" width={40} height={40} priority />
            <span className="text-lg font-bold text-scene-content truncate">{t("brand_name")}</span>
          </div>
          <LangSelect />
        </div>

        <h1 className="text-2xl font-bold text-scene-content">{t("sign_in")}</h1>

        <form
          noValidate
          className="grid gap-[var(--field-gap)]"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <Input
            name="username"
            label={t("username")}
            value={form.username}
            error={fieldErrors.username}
            onChange={updateField("username")}
          />
          <Input
            name="password"
            label={t("password")}
            type="password"
            value={form.password}
            error={fieldErrors.password}
            onChange={updateField("password")}
          />
          {error && (
            <p role="alert" className="field-error">
              {error}
            </p>
          )}
          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? t("signing_in") : t("sign_in")}
          </button>
        </form>
      </section>
    </main>
  );
}
