"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useApi } from "@/lib/useApi";
import { useLocale } from "@/lib/i18n";
import { FormButton, FormError, FormGuard, FormInput, rules, FormValues } from "@neighbor-link/formguard";

export default function Home() {
  const router = useRouter();
  const api = useApi();
  const { locale, locales, setLocale, localeProperties } = useLocale();
  const text = localeProperties.messages;
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(values: FormValues) {
    setError("");
    setIsLoading(true);

    try {
      await api("/auth/login", { ...values, role: "tenant" });
      router.push("/dashboard");
    } catch (submitError) {
      setError(submitError instanceof Error && submitError.message !== "Request failed" ? submitError.message : text.loginFailed);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-shell">
      <section className="login-panel">
        <div className="login-header">
          <Image className="eyebrow" src="/neighbor-link-logo.svg" alt={text.eyebrow} width={1197} height={356} priority />
          <button type="button" className="locale-switch" onClick={() => {
            const currentIndex = locales.findIndex((item) => item.code === locale);
            const nextLocale = locales[(currentIndex + 1) % locales.length];
            if (nextLocale) setLocale(nextLocale.code);
          }}>
            {localeProperties.name_short}
          </button>
        </div>
        <FormGuard
          initialValues={{ username: "tenant", password: "" }}
          onSubmit={handleSubmit}
          className="login-form"
          tokens={{ radius: "6px", focusColor: "#5268e8", buttonBackground: "#5268e8" }}
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
