import { useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { SignInGate } from "@/lib/auth/gates";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="grid min-h-dvh place-items-center px-4 py-10" style={{ background: "#04100c", color: "#f8f4e9" }}>
      <div className="w-full max-w-sm space-y-4">
        <p className="text-center text-[11px] uppercase tracking-[0.2em] opacity-70">الميزان</p>
        <h1 className="text-center font-serif text-3xl">Вход в кабинет</h1>
        <p className="text-center text-sm opacity-70">Два часа открыты всем. Дальше — аккаунт. Прогресс на сервере.</p>
        <SignInGate fallback={<LoginForm />}>
          <p className="text-center text-sm">Ты уже внутри.</p>
          <Link to="/" className="block rounded-full bg-[#f0cf7a] py-3 text-center text-[#04100c]">
            Домой
          </Link>
        </SignInGate>
      </div>
    </main>
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function onMail(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "up") {
        const r = await authClient.signUp.email({ email, password, name: email.split("@")[0] ?? "student", callbackURL: "/" });
        if (r.error) throw new Error(r.error.message);
      } else {
        const r = await authClient.signIn.email({ email, password, callbackURL: "/" });
        if (r.error) throw new Error(r.error.message);
      }
      window.location.href = "/";
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Не вышло");
    } finally {
      setBusy(false);
    }
  }

  if (!authEnabled) return <p className="text-sm opacity-60">Вход выключен.</p>;

  return (
    <div className="grid gap-3">
      {GROK_PROVIDERS.map((p) => (
        <button
          key={p.providerId}
          type="button"
          onClick={() => signIn(p.providerId, { callbackURL: "/" })}
          className="min-h-12 rounded-full border border-[#f0cf7a]/30 px-4"
        >
          {p.idp === "google" ? "Войти через Google" : "Войти через X"}
        </button>
      ))}
      <p className="text-center text-[11px] opacity-50">Почта — свой пароль на этом сервере</p>
      <form className="grid gap-2" onSubmit={onMail}>
        <input
          className="min-h-12 rounded-2xl border border-[#f0cf7a]/20 bg-transparent px-3"
          type="email"
          required
          placeholder="Почта"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <input
          className="min-h-12 rounded-2xl border border-[#f0cf7a]/20 bg-transparent px-3"
          type="password"
          required
          minLength={8}
          placeholder="Пароль, от 8 знаков"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={mode === "up" ? "new-password" : "current-password"}
        />
        {err ? <p className="text-sm text-[#ff8b82]">{err}</p> : null}
        <button type="submit" disabled={busy} className="min-h-12 rounded-full bg-[#f0cf7a] text-[#04100c]">
          {mode === "up" ? "Создать кабинет" : "Войти почтой"}
        </button>
      </form>
      <button type="button" className="text-sm opacity-70" onClick={() => setMode(mode === "up" ? "in" : "up")}>
        {mode === "up" ? "Уже есть кабинет" : "Нет кабинета — создать"}
      </button>
      <p className="text-center text-[11px] opacity-50">Telegram на этой платформе нельзя. Почта или Google.</p>
    </div>
  );
}
