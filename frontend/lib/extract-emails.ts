/** Pull unique email addresses from free-form team text. */
export function extractEmails(text: string): string[] {
  const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const found = text.match(re) ?? [];
  return [...new Set(found.map((e) => e.toLowerCase()))];
}
