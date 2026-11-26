"use client";

import { useState } from "react";
import {
  COMPANY_SIZES,
  CRYPTO_EXPERIENCE,
  INDUSTRIES,
  INTERESTS,
  ROLES,
  WOULD_USE,
  type Option,
} from "@/lib/survey";

type Result =
  | { status: "joined"; companyName: string; companySlug: string; position: number; companyTotal: number }
  | { status: "duplicate" };

function Select({ name, label, options }: { name: string; label: string; options: Option[] }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select name={name} defaultValue="">
        <option value="">Choose one</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </label>
  );
}

export default function SignupForm({ initialCompany }: { initialCompany: string }) {
  const [state, setState] = useState<"idle" | "sending">("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [copied, setCopied] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      email: form.get("email"),
      company: form.get("company"),
      website: form.get("website"),
      industry: form.get("industry"),
      companySize: form.get("companySize"),
      role: form.get("role"),
      cryptoExperience: form.get("cryptoExperience"),
      wouldUse: form.get("wouldUse"),
      interests: form.getAll("interests"),
    };
    setState("sending");
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong. Please try again.");
      setResult(data as Result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setState("idle");
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

      <fieldset className="survey">
        <legend>Help shape Morcoin <span className="muted">(optional)</span></legend>
        <div className="row">
          <Select name="industry" label="Your company's industry" options={INDUSTRIES} />
          <Select name="companySize" label="Company size" options={COMPANY_SIZES} />
        </div>
        <div className="row">
          <Select name="role" label="Your role" options={ROLES} />
          <Select name="cryptoExperience" label="Your experience with crypto" options={CRYPTO_EXPERIENCE} />
        </div>
        <div className="field">
          <span>What would you want to do with crypto? Pick any.</span>
          <div className="chips">
            {INTERESTS.map((o) => (
              <label key={o.value} className="chip">
                <input type="checkbox" name="interests" value={o.value} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="field">
          <span>If your company offered crypto through Morcoin, would you use it?</span>
          <div className="chips">
            {WOULD_USE.map((o) => (
              <label key={o.value} className="chip">
                <input type="radio" name="wouldUse" value={o.value} />
                <span>{o.label}</span>
              </label>
            ))}
          </div>
        </div>
      </fieldset>

      {error && <p className="error" role="alert">{error}</p>}
      <button className="button" disabled={state === "sending"}>
        {state === "sending" ? "Joining…" : "Join the waitlist"}
      </button>
      <p className="fine">
        We only ask for your email. No name, phone number or address. Survey answers are used
        in aggregate to understand demand, and we&apos;ll only email you about Morcoin.
      </p>
    </form>
  );
}
