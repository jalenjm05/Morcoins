# Morcoin

**A financial technology company built to solve crypto's biggest problem: adoption.**

Morcoin partners with businesses that want to make crypto a real part of how they operate, and in doing so brings crypto to the people those businesses already serve.

## The Problem

Crypto doesn't lack capital or technology. It lacks everyday use. Most people who hold crypto treat it as a speculative asset, not something they spend, earn, or use in daily life. Not enough people are using crypto.

## Our Angle

Instead of trying to convince consumers one at a time, Morcoin works through **businesses**. We partner with companies that want to make crypto part of their business. Every partner brings an existing customer base that already trusts them, and those customers become crypto's next users.

## Our Goal

Create demand, not just access. Plenty of companies already *allow* crypto payments, and almost no one uses them. Morcoin's job is to make crypto the option people actively choose, by delivering real value to both the businesses we partner with and their customers.

---

Follow us on X: [@morcoins](https://x.com/morcoins)

## Website

This repo holds Morcoin's landing page and waitlist (Next.js).

- **`/`**: landing page plus signup. People give two things: an email and the name of the company they work for.
- **`/waitlist/<company>`**: a shareable page for each company's waitlist, showing how many people have joined. Variations like "Acme Inc." and "ACME corp" share one waitlist.
- **`/api/stats`**: signup counts per company for the team, never emails. Requires `Authorization: Bearer <ADMIN_TOKEN>`.

### Run locally

```bash
npm install
npm run dev   # http://localhost:3000
```

Without a database, signups are saved to `.data/signups.json`, which is for local use only.

### Deploy (Vercel)

1. Import this repo in Vercel.
2. Add a Postgres database (Vercel → Storage → Neon) so `DATABASE_URL` is set. The `signups` table is created automatically.
3. Set `ADMIN_TOKEN` to a long random string. See `.env.example`.
