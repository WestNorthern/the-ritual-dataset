import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "@api/trpc/root"; // path alias must be set in tsconfig/vite

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  // In dev, use Vite proxy (see vite.config.ts)
  if (import.meta.env.DEV) return "";
  const base = import.meta.env.VITE_API_URL?.replace(/\/+$/, "");
  if (!base) {
    // Fail fast in preview/prod if not set at build time
    throw new Error("VITE_API_URL is required in non-dev builds");
  }
  return base;
}

export function createTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      loggerLink({ enabled: () => import.meta.env.DEV }),
      httpBatchLink({
        url: `${getBaseUrl()}/trpc`,
        // include cookies for auth
        fetch: (url, opts) => fetch(url, { ...opts, credentials: "include" }),
      }),
    ],
    // If you use superjson on the API, also set `transformer` here
    // transformer: superjson,
  });
}
