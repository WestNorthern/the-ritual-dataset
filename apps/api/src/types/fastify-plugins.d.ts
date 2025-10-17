// Make sure Fastify has the cookie/jwt decorators during type-only builds
import '@fastify/cookie';
import '@fastify/jwt';

// If your TS still complains, uncomment the augmentation below
// to hard-assert the decorator shapes (keeps CI happy).
/*
declare module 'fastify' {
  interface FastifyReply {
    setCookie(
      name: string,
      value: string,
      options?: import('@fastify/cookie').CookieSerializeOptions
    ): this;
    clearCookie(
      name: string,
      options?: import('@fastify/cookie').CookieSerializeOptions
    ): this;

    // Provided by @fastify/jwt
    jwtSign?: (payload: unknown) => Promise<string>;
  }
  interface FastifyRequest {
    cookies: Record<string, string>;
    // Provided by @fastify/jwt
    jwtVerify?: <T = unknown>() => Promise<T>;
  }
}
*/
export {};