"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { useLocale } from "@/lib/i18n";

export default function Home() {
  const router = useRouter();
  const api = useApi();
  const { text, locale, setLocale } = useLocale();
  const [username, setUsername] = useState("tenant");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await api("/auth/login", { username, password, role: "tenant" });
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
          <p className="eyebrow">{text.eyebrow}</p>
          <button type="button" className="locale-switch" onClick={() => setLocale(locale === "en" ? "zh" : "en")}>
            {text.language}
          </button>
        </div>
        <h1>{text.title}</h1>
        <p className="intro">{text.intro}</p>
        <form onSubmit={handleSubmit} className="login-form">
          <label>
            {text.username}
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          </label>
          <label>
            {text.password}
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" autoComplete="current-password" required />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button type="submit" disabled={isLoading}>
            {isLoading ? text.signingIn : text.signIn}
          </button>
        </form>
      </section>
    </main>
  );
}
