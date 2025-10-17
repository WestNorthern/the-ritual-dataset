// apps/api/src/utils/cookies.ts
import type { FastifyReply } from "fastify";

const THIRTY_DAYS = 60 * 60 * 24 * 30;

function sessionCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  // Use explicit literal union types (no `as const` on a ternary)
  const sameSite: "none" | "lax" = isProd ? "none" : "lax";
  const secure: boolean = isProd;

  return {
    path: "/",
    httpOnly: true as const,
    sameSite, // "none" in prod, "lax" in dev
    secure, // true in prod (required with SameSite=None)
    maxAge: THIRTY_DAYS,
  };
}

export const COOKIE_NAME = "trd_session";

export function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(COOKIE_NAME, token, sessionCookieOptions());
}

export function clearSessionCookie(reply: FastifyReply) {
  // mirror key flags when clearing to ensure deletion across browsers
  const opts = sessionCookieOptions();
  reply.clearCookie(COOKIE_NAME, {
    path: opts.path,
    sameSite: opts.sameSite,
    secure: opts.secure,
  });
}
