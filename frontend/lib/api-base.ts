/** Backend API origin (no trailing slash). */
export function apiBaseUrl(): string {
  let raw = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "").trim();
  if (!raw && process.env.NODE_ENV === "development") {
    raw = "http://localhost:8000";
  }
  return raw.replace(/\/$/, "");
}
