"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { useLocale } from "@/i18n";
import { useLoginMutation } from "@/store/authApi";
import LangSelect from "@/components/LangSelect";
import { Input } from "@/components/ui/Input";
import { FormButton, FormError, FormGuard } from "@matthew2003/formguard";

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
      await login({ username: form.username, password: form.password, role: "tenant" }).unwrap();
      router.push("/dashboard");
    } catch (submitError) {
      setError(getErrorMessage(submitError) ?? t("login_failed"));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-header">
          <Image className="eyebrow" src="/neighbor-link-logo.svg" alt={t("brand_name")} width={1197} height={356} priority />
          <LangSelect />
        </div>
        <FormGuard
          initialValues={{ username: "", password: "" }}
          onSubmit={handleSubmit}
          className="login-form"
          tokens={{ radius: "6px", focusColor: "#315b57", buttonBackground: "#315b57" }}
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
          <FormError>{error}</FormError>
          <FormButton loading={isLoading}>{isLoading ? t("signing_in") : t("sign_in")}</FormButton>
        </FormGuard>
      </section>
    </main>
  );
}
