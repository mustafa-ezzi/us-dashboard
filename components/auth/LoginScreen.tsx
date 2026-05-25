"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Heart, Loader2 } from "lucide-react";

export function LoginScreen() {
  const { signInWithPassword } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErr(null);
    const { error } = await signInWithPassword(email.trim(), password);
    if (error) setErr(error);
    setBusy(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center animate-slide-up">
          <span className="grid h-14 w-14 place-items-center rounded-3xl bg-rose text-white shadow-card animate-float">
            <Heart size={24} fill="white" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink">
            Us Dashboard
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Sign in to your private corner.
          </p>
        </div>

        <form
          onSubmit={submit}
          className="card space-y-3 p-5 animate-fade-in"
          autoComplete="on"
        >
          <div>
            <label className="label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              className="input mt-1.5"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              className="input mt-1.5"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {err && (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-700">
              {err}
            </p>
          )}

          <button
            type="submit"
            disabled={busy || !email || !password}
            className="btn-primary w-full"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>

          <p className="pt-1 text-center text-[11px] text-ink-subtle">
            Invite-only. If you're not Mustafa or Ummehani, you're in the wrong
            place.
          </p>
        </form>
      </div>
    </div>
  );
}
