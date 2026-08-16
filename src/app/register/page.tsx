"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(
        error.message === "User already registered"
          ? "Tento e-mail už je zaregistrovaný."
          : error.message
      );
      setLoading(false);
      return;
    }

    if (data.session) {
      router.push("/profile");
      router.refresh();
      return;
    }

    setNeedsConfirmation(true);
    setLoading(false);
  }

  if (needsConfirmation) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary-soft">
          <MailCheck className="h-6 w-6 text-accent" strokeWidth={1.75} />
        </div>
        <h1 className="mt-5 font-display text-xl font-semibold text-fg">Zkontroluj e-mail</h1>
        <p className="mt-2 max-w-xs text-sm text-muted">
          Poslali jsme potvrzovací odkaz na <span className="font-medium text-fg">{email}</span>.
          Po potvrzení se budeš moct přihlásit.
        </p>
        <Link
          href="/login"
          className="mt-6 rounded-2xl bg-gradient-primary px-6 py-3 text-sm font-semibold text-black shadow-glow-sm"
        >
          Zpět na přihlášení
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-12">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-10 text-center">
          <div className="mb-1 flex items-center justify-center gap-1.5">
            <span className="bg-gradient-primary bg-clip-text font-display text-3xl font-bold tracking-tight text-transparent">
              Bydlino
            </span>
          </div>
          <p className="text-sm text-muted">Založ si účet a začni hledat</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="name" className="mb-1.5 block text-xs font-medium text-muted">
              Jméno
            </label>
            <input
              id="name"
              type="text"
              required
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jana Nováková"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none transition-colors focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-muted">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jana@vut.cz"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none transition-colors focus:border-accent"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-muted">
              Heslo
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="alespoň 6 znaků"
              className="w-full rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-fg outline-none transition-colors focus:border-accent"
            />
          </div>

          {error && <p className="text-sm text-accent">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-primary py-3.5 text-sm font-semibold text-black shadow-glow-sm transition-transform active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Vytvořit účet
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Už máš účet?{" "}
          <Link href="/login" className="font-semibold text-fg underline underline-offset-2">
            Přihlas se
          </Link>
        </p>
      </div>
    </div>
  );
}
