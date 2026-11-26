import { NextResponse } from "next/server";
import { companySlug, cleanCompanyName } from "@/lib/company";
import { getStore } from "@/lib/store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real people never see or fill this field; bots often do.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ status: "duplicate" });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const companyName = cleanCompanyName(typeof body.company === "string" ? body.company : "");
  const slug = companySlug(companyName);
  if (!slug) {
    return NextResponse.json({ error: "Please tell us the company you work for." }, { status: 400 });
  }

  try {
    const result = await getStore().addSignup({
      email,
      companyName,
      companySlug: slug,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("signup failed", err);
    return NextResponse.json({ error: "Something went wrong on our end. Please try again." }, { status: 500 });
  }
}
