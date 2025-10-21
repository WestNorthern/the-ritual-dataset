import { trpc } from "../lib/trpc";
import { useNavigate } from "react-router-dom";

export function RitualStart() {
  const { data, isLoading } = trpc.rituals.list.useQuery();
  const start = trpc.sessions.start.useMutation();
  const navigate = useNavigate();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (!data?.length) return <div className="p-6">No rituals available.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Choose a ritual</h1>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((r) => (
          <li key={r.id}>
            <button
              disabled={start.isPending}
              onClick={async () => {
                const s = await start.mutateAsync({ ritualId: r.id });
                navigate(`/app/run/${s.id}`, { replace: true });
              }}
              className="w-full rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow"
            >
              <div className="font-semibold">{r.name}</div>
              <div className="text-xs text-gray-500">{r._count.steps} steps</div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
