export function sanitizeNext(raw: string, fallback = "/app"): string {
  try {
    const decoded = decodeURIComponent(raw ?? "");
    const s = decoded.trim();

    // must start with exactly one slash
    if (!s.startsWith("/") || s.startsWith("//")) return fallback;

    // disallow explicit schemes like http:, https:, javascript:, etc.
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(s)) return fallback;

    return s;
  } catch {
    return fallback;
  }
}
