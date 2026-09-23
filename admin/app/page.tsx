"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocale } from "@/lib/i18n";
import { useLoginMutation } from "@/lib/store/authApi";
import LangSelect from "@/app/components/LangSelect";
import { FormButton, FormError, FormGuard, FormInput, rules, FormValues } from "@matthew2003/formguard";

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === "object" && error !== null && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === "object" && data !== null && "error" in data && typeof (data as { error: unknown }).error === "string") {
      return (data as { error: string }).error;
    }
  }
  return undefined;
}

export default function Home() {
  const router = useRouter();
  const [login] = useLoginMutation();
  const { localeProperties } = useLocale();
  const text = localeProperties.messages;
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: FormValues) {
    setError("");
    setIsLoading(true);

    try {
      await login({ username: values.username as string, password: values.password as string, role: "admin" }).unwrap();
      router.push("/dashboard");
    } catch (submitError) {
      setError(getErrorMessage(submitError) ?? text.loginFailed);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-header">
          <Image className="eyebrow" src="/neighbor-link-logo.svg" alt={text.eyebrow} width={1197} height={356} priority />
          <LangSelect />
        </div>
        <FormGuard
          initialValues={{ username: "admin", password: "" }}
          onSubmit={handleSubmit}
          className="login-form"
          tokens={{ radius: "6px", focusColor: "#315b57", buttonBackground: "#315b57" }}
        >
          <FormInput name="username" label={text.username} autoComplete="username" validators={[rules.required(text.required)]} />
          <FormInput name="password" label={text.password} type="password" autoComplete="current-password" validators={[rules.required(text.required)]} />
          <FormError>{error}</FormError>
          <FormButton loading={isLoading}>{isLoading ? text.signingIn : text.signIn}</FormButton>
        </FormGuard>
      </section>
    </main>
  );
}
