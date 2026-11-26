// Turns what people type ("Starbucks", "starbucks inc.", "STARBUCKS CORP") into one
// waitlist key so coworkers land on the same company waitlist.

const SUFFIXES = new Set([
  "inc", "incorporated", "llc", "llp", "ltd", "limited", "corp", "corporation",
  "co", "company", "plc", "gmbh", "sa", "ag", "pllc", "lp",
]);

export function companySlug(name: string): string {
  const words = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  // Drop legal suffixes from the end ("Acme Co LLC" → "acme"), but never every word.
  while (words.length > 1 && SUFFIXES.has(words[words.length - 1])) words.pop();
  if (words[0] === "the" && words.length > 1) words.shift();
  return words.join("-").slice(0, 80);
}

/** Display form of the company name: trimmed, collapsed spaces, length-capped. */
export function cleanCompanyName(name: string): string {
  return name.replace(/\s+/g, " ").trim().slice(0, 100);
}
