import { createTRPCReact } from "@trpc/react-query";
import { createTRPCClient, httpBatchLink, loggerLink } from "@trpc/client";
import type { AppRouter } from "@api/trpc/root"; // type-only from the API

export const trpc = createTRPCReact<AppRouter>();

function getBaseUrl() {
  // Use proxy in dev (''), env in preview/prod
  if (import.meta.env.DEV) return "";
  return (import.meta.env.VITE_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
}

export function createTrpcClient() {
  return createTRPCClient<AppRouter>({
    links: [
      loggerLink({ enabled: () => import.meta.env.DEV }),
      httpBatchLink({
        url: `${getBaseUrl()}/trpc`,
        fetch: (url, opts) => fetch(url, { ...opts, credentials: "include" }),
      }),
    ],
  });
}
