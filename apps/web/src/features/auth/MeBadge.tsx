import { trpc } from "../../lib/trpc";

export function MeBadge() {
  const { data, isLoading } = trpc.auth.me.useQuery();

  if (isLoading) return <span className="opacity-60">…</span>;
  if (!data) return <a href="/login" className="underline">Sign in</a>;

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-sm">
      <span className="i-lucide-user w-4 h-4" />
      {data.fullName ?? data.alias}
    </span>
  );
}
