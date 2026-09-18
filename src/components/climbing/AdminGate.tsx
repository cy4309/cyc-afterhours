"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminGate() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error || "Invalid password.");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-md space-y-8">
      <label className="block space-y-2">
        <span className="text-kicker uppercase tracking-kicker">Password</span>
        <input
          type="password"
          value={password}
          autoComplete="current-password"
          disabled={busy}
          onChange={(event) => setPassword(event.target.value)}
          className="w-full border-b border-ink bg-transparent py-2 text-sm outline-none"
          required
        />
      </label>
      {error ? <p className="text-kicker uppercase tracking-meta text-mute">{error}</p> : null}
      <button type="submit" disabled={busy} className="text-kicker uppercase tracking-kicker disabled:text-mute">
        Enter
      </button>
    </form>
  );
}

export function AdminSignOut() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      type="button"
      disabled={busy}
      className="cursor-pointer text-kicker uppercase tracking-kicker text-mute hover:text-ink disabled:text-mute"
      onClick={async () => {
        setBusy(true);
        await fetch("/api/admin/logout", { method: "POST" });
        router.refresh();
        router.push("/");
      }}
    >
      Sign out
    </button>
  );
}
