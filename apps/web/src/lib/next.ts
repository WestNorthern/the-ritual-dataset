
export function sanitizeNext(n: string | undefined | null, fallback = "/app") {
  if (!n) return fallback;
  if (n.startsWith("http://") || n.startsWith("https://")) return fallback; // disallow off-site
  if (!n.startsWith("/")) return fallback;                                   // must be site-relative
  return n;
}
