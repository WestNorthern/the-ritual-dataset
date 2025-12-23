import "../index.css";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider } from "react-router-dom";
import { trpc, createTrpcClient } from "../lib/trpc";
import { router } from "../routes";

/**
 * TanStack Query best practices:
 * - staleTime: How long data is considered fresh (won't refetch)
 * - gcTime: How long inactive data stays in cache before garbage collection
 * - retry: Number of retries on failure (mutations should not retry)
 * - refetchOnWindowFocus: Disabled — we prefer explicit invalidation
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,        // 1 minute — data is fresh, no refetch
      gcTime: 1000 * 60 * 10,      // 10 minutes — keep in cache when inactive
      retry: 1,                     // Retry once on network failure
      refetchOnWindowFocus: false,  // Explicit invalidation preferred
      refetchOnReconnect: true,     // Refetch when coming back online
    },
    mutations: {
      retry: 0,                     // Never retry mutations (avoid double-submit)
    },
  },
});

const trpcClient = createTrpcClient();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
      </QueryClientProvider>
    </trpc.Provider>
  </React.StrictMode>,
);
