import { trpc } from "../../lib/trpc";

export function useAuth() {
  const query = trpc.auth.me.useQuery(undefined, {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  return { me: query.data, isLoading: query.isLoading };
}
