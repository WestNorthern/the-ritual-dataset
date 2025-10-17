import { trpc } from "../../lib/trpc";
export function useMe() {
  // no retries to avoid loops
  return trpc.auth.me.useQuery(undefined, { retry: false, staleTime: 60_000 });
}
