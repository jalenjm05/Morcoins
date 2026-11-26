import type { Metadata } from "next";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ company: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { company } = await params;
  const summary = await getStore().getCompany(company);
  const name = summary?.companyName;
  return {
    title: name ? `Bring Morcoin to ${name}` : "Start your company's Morcoin waitlist",
    description: name
      ? `Join the ${name} waitlist and help bring crypto to where you work.`
      : "Be the first from your company to join the Morcoin waitlist.",
  };
}

export default async function CompanyWaitlist({ params }: Props) {
  const { company } = await params;
  const summary = await getStore().getCompany(company);
  const name = summary?.companyName ?? null;
  const joinHref = name ? `/?company=${encodeURIComponent(name)}#join` : "/#join";

  return (
    <main className="hero company">
      <p className="eyebrow">Company waitlist</p>
      {summary ? (
        <>
          <h1>
            <span className="accent">{summary.companyName}</span>
          </h1>
          <p className="count">
            <strong>{summary.total}</strong> {summary.total === 1 ? "person has" : "people have"} joined
          </p>
          <p className="lede">
            People at {summary.companyName} want crypto where they work. Add your name to the
            list. The more people join, the stronger the case for bringing Morcoin here first.
          </p>
        </>
      ) : (
        <>
          <h1>No one has started this waitlist yet.</h1>
          <p className="lede">Be the first from your company to join.</p>
        </>
      )}
      <a className="button" href={joinHref}>Join this waitlist</a>
    </main>
  );
}
