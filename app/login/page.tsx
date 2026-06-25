"use client";

import { useState } from "react";
import { BrandLogo } from "@shared/ui/BrandLogo";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [state, setState] = useState<"idle" | "submitting" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      window.location.href = "/";
    } catch (err) {
      setMsg((err as Error).message);
      setState("error");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-6">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-panel p-8 shadow-lift">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo className="h-16 w-16 rounded-2xl" />
          <h1 className="mt-4 font-display text-xl font-medium text-ink">Sampeer Studio</h1>
          <p className="text-xs text-muted">Automations / Owner sign-in</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted">Username</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <button
            type="submit"
            disabled={state === "submitting"}
            className="w-full rounded-lg bg-brand px-4 py-2.5 font-semibold text-white shadow-soft transition hover:bg-brand-700 disabled:opacity-50"
          >
            {state === "submitting" ? "Signing in..." : "Sign in"}
          </button>
          {state === "error" && (
            <p className="text-sm text-danger">{msg}</p>
          )}
          <p className="text-center text-xs text-muted/70">
            Access is restricted to the studio owner.
          </p>
        </form>
      </div>
    </main>
  );
}
