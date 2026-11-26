"use client";

import { useState } from "react";

type Result =
  | { status: "joined"; companyName: string; companySlug: string; position: number; companyTotal: number }
  | { status: "duplicate" };

export default function SignupForm({ initialCompany }: { initialCompany: string }) {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    setSending(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          company: form.get("company"),
          website: form.get("website"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  }

  if (result?.status === "duplicate") {
    return (
      <div className="card success">
        <h3>You&apos;re already on the list.</h3>
        <p>That email has already joined a waitlist. We&apos;ll be in touch.</p>
      </div>
    );
  }

  if (result?.status === "joined") {
    const link = `${window.location.origin}/waitlist/${result.companySlug}`;
    const others = result.companyTotal - 1;
    return (
      <div className="card success">
        <p className="eyebrow">You&apos;re in</p>
        <h3>
          You&apos;re #{result.position} on the <span className="accent">{result.companyName}</span> waitlist.
        </h3>
        <p>
          {others === 0
            ? "You're the first from your company. Share the link with coworkers to move your company up the list."
            : `${others} ${others === 1 ? "coworker has" : "coworkers have"} joined too. Keep it going.`}
        </p>
        <div className="share">
          <code>{link}</code>
          <button
            type="button"
            className="button small"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(link);
                setCopied(true);
              } catch {
                /* clipboard blocked; link is visible to copy by hand */
              }
            }}
          >
            {copied ? "Copied" : "Copy link"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form className="card form" onSubmit={onSubmit}>
      <div className="row">
        <label className="field">
          <span>Email</span>
          <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
        </label>
        <label className="field">
          <span>Company you work for</span>
          <input
            name="company"
            required
            maxLength={100}
            defaultValue={initialCompany}
            autoComplete="organization"
            placeholder="e.g. Acme Coffee"
          />
        </label>
      </div>

      {/* Honeypot for bots: hidden from people and screen readers. */}
      <input name="website" tabIndex={-1} autoComplete="off" className="hp" aria-hidden />

      {error && <p className="error" role="alert">{error}</p>}
      <button className="button" disabled={sending}>
        {sending ? "Joining…" : "Join the waitlist"}
      </button>
      <p className="fine">That&apos;s it. We&apos;ll only email you about Morcoin.</p>
    </form>
  );
}
