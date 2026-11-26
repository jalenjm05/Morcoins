// Survey questions shown on the signup form. Every answer is about the person's work
// and their relationship to crypto — never their name, phone, address, or other
// personal details. Email is the only contact field.

export type Option = { value: string; label: string };

export const INDUSTRIES: Option[] = [
  { value: "retail", label: "Retail & e-commerce" },
  { value: "food", label: "Restaurants & food service" },
  { value: "hospitality", label: "Hospitality & travel" },
  { value: "tech", label: "Technology & software" },
  { value: "finance", label: "Finance & banking" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "entertainment", label: "Entertainment & media" },
  { value: "services", label: "Professional services" },
  { value: "manufacturing", label: "Manufacturing & logistics" },
  { value: "other", label: "Other" },
];

export const COMPANY_SIZES: Option[] = [
  { value: "1-10", label: "1–10 people" },
  { value: "11-50", label: "11–50" },
  { value: "51-200", label: "51–200" },
  { value: "201-1000", label: "201–1,000" },
  { value: "1000+", label: "1,000+" },
];

export const ROLES: Option[] = [
  { value: "owner", label: "Owner or founder" },
  { value: "leadership", label: "Leadership or management" },
  { value: "employee", label: "Employee" },
  { value: "contractor", label: "Contractor or freelancer" },
];

export const CRYPTO_EXPERIENCE: Option[] = [
  { value: "never", label: "I've never used crypto" },
  { value: "curious", label: "I've looked into it but don't own any" },
  { value: "holder", label: "I own some, but rarely use it" },
  { value: "active", label: "I use crypto regularly" },
];

export const INTERESTS: Option[] = [
  { value: "pay", label: "Paying with crypto at checkout" },
  { value: "rewards", label: "Earning crypto as rewards or cashback" },
  { value: "paid", label: "Getting paid (wages or tips) in crypto" },
  { value: "international", label: "Sending money across borders" },
  { value: "save", label: "Saving or holding crypto" },
];

export const WOULD_USE: Option[] = [
  { value: "yes", label: "Yes" },
  { value: "maybe", label: "Maybe" },
  { value: "no", label: "Not yet" },
];

export type SurveyAnswers = {
  industry: string | null;
  companySize: string | null;
  role: string | null;
  cryptoExperience: string | null;
  interests: string[];
  wouldUse: string | null;
};

function pick(options: Option[], value: unknown): string | null {
  return typeof value === "string" && options.some((o) => o.value === value) ? value : null;
}

/** Keeps only answers that match a known option; anything else is dropped. */
export function cleanSurvey(input: Record<string, unknown>): SurveyAnswers {
  const rawInterests = Array.isArray(input.interests) ? input.interests : [];
  return {
    industry: pick(INDUSTRIES, input.industry),
    companySize: pick(COMPANY_SIZES, input.companySize),
    role: pick(ROLES, input.role),
    cryptoExperience: pick(CRYPTO_EXPERIENCE, input.cryptoExperience),
    interests: [...new Set(rawInterests)].filter(
      (v): v is string => pick(INTERESTS, v) !== null,
    ),
    wouldUse: pick(WOULD_USE, input.wouldUse),
  };
}
