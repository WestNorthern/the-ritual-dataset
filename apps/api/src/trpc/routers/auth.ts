// apps/api/src/trpc/routers/auth.ts
import { initTRPC, TRPCError } from '@trpc/server';
import { z } from 'zod';
import type { Context } from '../context';
import { prisma } from '../../prisma';

const t = initTRPC.context<Context>().create();

const COOKIE_NAME = 'trd_session';
const COOKIE_OPTS = {
  httpOnly: true as const,
  sameSite: 'lax' as const,
  path: '/',
  secure: false,                  // set true behind HTTPS
  maxAge: 60 * 60 * 24 * 30,      // 30 days
};

type JwtPayload = { wid: string };

function signJwt(ctx: Context, payload: JwtPayload) {
  // Uses the Fastify instance’s signer (sync is fine for short payloads)
  const signer = (ctx.req.server as any)?.jwt?.sign as ((p: any) => string) | undefined;
  if (!signer) throw new Error('fastify.jwt.sign not available — is @fastify/jwt registered?');
  return signer(payload);
}

function readJwtFromCookie(ctx: Context): JwtPayload | null {
  const token = (ctx.req.cookies ?? {})[COOKIE_NAME];
  if (!token) return null;
  try {
    const verify = (ctx.req.server as any)?.jwt?.verify as (<T>(t: string) => T) | undefined;
    if (!verify) return null;
    return verify<JwtPayload>(token);
  } catch {
    return null;
  }
}

export const authRouter = t.router({
  registerLocal: t.procedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(12),
      alias: z.string().min(1),
      fullName: z.string().min(1).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { email, password, alias, fullName } = input;

      // Upsert-ish flow: if identity exists, just issue cookie and return
      const existing = await prisma.authIdentity.findUnique({
        where: { provider_email: { provider: 'local', email } },
        select: { witnessId: true },
      });
      if (existing) {
        const token = signJwt(ctx, { wid: existing.witnessId });
        ctx.reply.setCookie(COOKIE_NAME, token, COOKIE_OPTS);
        return { witnessId: existing.witnessId, already: true as const };
      }

      const bcrypt = await import('bcryptjs');
      const pwHash = await bcrypt.hash(password, 10);

      const w = await prisma.witness.create({
        data: {
          alias,
          fullName,
          identities: {
            create: {
              provider: 'local',
              email,
              passwordHash: pwHash,
              subject: email.toLowerCase(),
            },
          },
        },
        select: { id: true },
      });

      const token = signJwt(ctx, { wid: w.id });
      ctx.reply.setCookie(COOKIE_NAME, token, COOKIE_OPTS);
      return { witnessId: w.id };
    }),

  loginLocal: t.procedure
    .input(z.object({ email: z.string().email(), password: z.string().min(12) }))
    .mutation(async ({ input, ctx }) => {
      const id = await prisma.authIdentity.findUnique({
        where: { provider_email: { provider: 'local', email: input.email } },
        include: { witness: { select: { id: true } } },
      });

      if (!id?.passwordHash) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      const bcrypt = await import('bcryptjs');
      const ok = await bcrypt.compare(input.password, id.passwordHash);
      if (!ok) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }

      const token = signJwt(ctx, { wid: id.witness.id });
      ctx.reply.setCookie(COOKIE_NAME, token, COOKIE_OPTS);
      return { ok: true as const, witnessId: id.witness.id };
    }),

  me: t.procedure.query(async ({ ctx }) => {
    const payload = readJwtFromCookie(ctx);
    if (!payload) return null;

    const w = await prisma.witness.findUnique({
      where: { id: payload.wid },
      select: { id: true, alias: true, fullName: true },
    });
    if (!w) return null;

    return { id: w.id, alias: w.alias, fullName: w.fullName ?? null };
  }),

  logout: t.procedure.mutation(async ({ ctx }) => {
    ctx.reply.clearCookie(COOKIE_NAME, { path: '/' });
    return { ok: true as const };
  }),
});
