import type { FastifyRequest, FastifyReply } from "fastify";

export async function createContext({ req, res }: { req: FastifyRequest; res: FastifyReply }) {
  return {
    req,
    res,
    reply: res, // alias – so ctx.reply.setCookie(...) works
  };
}
export type Context = Awaited<ReturnType<typeof createContext>>;
