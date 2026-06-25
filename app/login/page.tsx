"use client";

import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      setMsg(data.message ?? "Check your inbox for the sign-in link.");
      setState("sent");
    } catch (err) {
      setMsg((err as Error).message);
      setState("error");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">
            S
          </div>
          <div>
            <h1 className="text-lg font-bold text-brand">Sampeer Automations</h1>
            <p className="text-xs text-slate-500">Owner sign-in</p>
          </div>
        </div>

        {state === "sent" ? (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            {msg}
            <p className="mt-2 text-xs text-green-600">
              The link expires in 10 minutes. Check spam if you don&apos;t see it.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-slate-600">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <button
              type="submit"
              disabled={state === "sending"}
              className="w-full rounded-lg bg-accent px-4 py-2.5 font-semibold text-white transition hover:bg-indigo-600 disabled:opacity-50"
            >
              {state === "sending" ? "Sending…" : "Send magic link"}
            </button>
            {state === "error" && (
              <p className="text-sm text-red-600">{msg}</p>
            )}
            <p className="text-center text-xs text-slate-400">
              Access is restricted to the studio owner.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
