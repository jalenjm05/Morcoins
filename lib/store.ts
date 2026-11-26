// Signup storage. Uses Postgres when DATABASE_URL is set (production), otherwise a
// local JSON file so the site runs with zero setup during development.
import { neon } from "@neondatabase/serverless";
import { promises as fs } from "fs";
import path from "path";
import type { SurveyAnswers } from "./survey";

export type NewSignup = {
  email: string;
  companyName: string;
  companySlug: string;
  survey: SurveyAnswers;
};

export type WaitlistResult =
  | { status: "joined"; companyName: string; companySlug: string; position: number; companyTotal: number }
  | { status: "duplicate" };

export type CompanySummary = { companyName: string; companySlug: string; total: number };

export type Stats = {
  totalSignups: number;
  totalCompanies: number;
  topCompanies: CompanySummary[];
  breakdowns: Record<string, Record<string, number>>;
};

interface Store {
  addSignup(s: NewSignup): Promise<WaitlistResult>;
  getCompany(slug: string): Promise<CompanySummary | null>;
  getStats(): Promise<Stats>;
}

type Row = NewSignup & { id: number; createdAt: string };

const SURVEY_KEYS = ["industry", "companySize", "role", "cryptoExperience", "wouldUse"] as const;

function buildStats(rows: Row[]): Stats {
  const companies = new Map<string, CompanySummary>();
  const breakdowns: Record<string, Record<string, number>> = { interests: {} };
  for (const key of SURVEY_KEYS) breakdowns[key] = {};

  for (const r of rows) {
    const c = companies.get(r.companySlug) ?? { companyName: r.companyName, companySlug: r.companySlug, total: 0 };
    c.total++;
    companies.set(r.companySlug, c);
    for (const key of SURVEY_KEYS) {
      const v = r.survey[key] ?? "unanswered";
      breakdowns[key][v] = (breakdowns[key][v] ?? 0) + 1;
    }
    for (const i of r.survey.interests) breakdowns.interests[i] = (breakdowns.interests[i] ?? 0) + 1;
  }
  return {
    totalSignups: rows.length,
    totalCompanies: companies.size,
    topCompanies: [...companies.values()].sort((a, b) => b.total - a.total).slice(0, 25),
    breakdowns,
  };
}

// ---------- Local JSON file (development) ----------

class FileStore implements Store {
  private file = path.join(process.cwd(), ".data", "signups.json");
  private queue: Promise<unknown> = Promise.resolve();

  private async read(): Promise<Row[]> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8")) as Row[];
    } catch {
      return [];
    }
  }

  // Serialize writes so concurrent signups in dev don't clobber each other.
  private locked<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.queue.then(fn, fn);
    this.queue = next.catch(() => undefined);
    return next;
  }

  addSignup(s: NewSignup): Promise<WaitlistResult> {
    return this.locked(async () => {
      const rows = await this.read();
      if (rows.some((r) => r.email === s.email)) return { status: "duplicate" as const };
      const row: Row = { ...s, id: rows.length + 1, createdAt: new Date().toISOString() };
      rows.push(row);
      await fs.mkdir(path.dirname(this.file), { recursive: true });
      await fs.writeFile(this.file, JSON.stringify(rows, null, 2));
      const coworkers = rows.filter((r) => r.companySlug === s.companySlug);
      return {
        status: "joined" as const,
        companyName: coworkers[0].companyName,
        companySlug: s.companySlug,
        position: coworkers.length,
        companyTotal: coworkers.length,
      };
    });
  }

  async getCompany(slug: string): Promise<CompanySummary | null> {
    const rows = (await this.read()).filter((r) => r.companySlug === slug);
    return rows.length ? { companyName: rows[0].companyName, companySlug: slug, total: rows.length } : null;
  }

  async getStats(): Promise<Stats> {
    return buildStats(await this.read());
  }
}

// ---------- Postgres (production) ----------

class PostgresStore implements Store {
  private sql = neon(process.env.DATABASE_URL!);
  private ready: Promise<unknown> | null = null;

  private init() {
    this.ready ??= (async () => {
      await this.sql`
        CREATE TABLE IF NOT EXISTS signups (
          id            BIGSERIAL PRIMARY KEY,
          email         TEXT NOT NULL UNIQUE,
          company_name  TEXT NOT NULL,
          company_slug  TEXT NOT NULL,
          survey        JSONB NOT NULL DEFAULT '{}'::jsonb,
          created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        )`;
      await this.sql`CREATE INDEX IF NOT EXISTS signups_company_slug_idx ON signups (company_slug, id)`;
    })().catch((e) => {
      this.ready = null; // retry on next request
      throw e;
    });
    return this.ready;
  }

  async addSignup(s: NewSignup): Promise<WaitlistResult> {
    await this.init();
    const inserted = await this.sql`
      INSERT INTO signups (email, company_name, company_slug, survey)
      VALUES (${s.email}, ${s.companyName}, ${s.companySlug}, ${JSON.stringify(s.survey)}::jsonb)
      ON CONFLICT (email) DO NOTHING
      RETURNING id`;
    if (inserted.length === 0) return { status: "duplicate" };
    const id = inserted[0].id;
    const [row] = await this.sql`
      SELECT
        (SELECT company_name FROM signups WHERE company_slug = ${s.companySlug} ORDER BY id LIMIT 1) AS company_name,
        (SELECT count(*) FROM signups WHERE company_slug = ${s.companySlug} AND id <= ${id})::int AS position,
        (SELECT count(*) FROM signups WHERE company_slug = ${s.companySlug})::int AS total`;
    return {
      status: "joined",
      companyName: row.company_name,
      companySlug: s.companySlug,
      position: row.position,
      companyTotal: row.total,
    };
  }

  async getCompany(slug: string): Promise<CompanySummary | null> {
    await this.init();
    const [row] = await this.sql`
      SELECT (array_agg(company_name ORDER BY id))[1] AS company_name, count(*)::int AS total
      FROM signups WHERE company_slug = ${slug}`;
    return row && row.total > 0 ? { companyName: row.company_name, companySlug: slug, total: row.total } : null;
  }

  async getStats(): Promise<Stats> {
    await this.init();
    const rows = await this.sql`SELECT id, company_name, company_slug, survey FROM signups ORDER BY id`;
    return buildStats(
      rows.map((r) => ({
        id: Number(r.id),
        email: "",
        companyName: r.company_name,
        companySlug: r.company_slug,
        survey: r.survey as SurveyAnswers,
        createdAt: "",
      })),
    );
  }
}

let store: Store | null = null;
export function getStore(): Store {
  if (!store) {
    if (process.env.DATABASE_URL) store = new PostgresStore();
    else if (process.env.VERCEL) throw new Error("DATABASE_URL is not set: signups cannot be saved on Vercel without a database.");
    else store = new FileStore();
  }
  return store;
}
