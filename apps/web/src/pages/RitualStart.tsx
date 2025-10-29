import { trpc } from "../lib/trpc";
import { useNavigate } from "react-router-dom";

export function RitualStart() {
  const navigate = useNavigate();

  // List rituals (make sure API returns: id, name, _count: { steps })
  const { data, isLoading, error: listError } = trpc.rituals.list.useQuery();

  // Start a session for a ritual
  const {
    mutateAsync: startSession,
    isPending,
    error: startError,
    reset: resetStartError,
  } = trpc.sessions.start.useMutation();

  if (isLoading) return <div className="p-6">Loading…</div>;
  if (listError) return <div className="p-6 text-red-600">Error: {listError.message}</div>;
  if (!data?.length) return <div className="p-6">No rituals available.</div>;

  const handleBegin = async (ritualId: string) => {
    try {
      resetStartError();
      const s = await startSession({ ritualId }); // returns { id }
      navigate(`/app/run/${s.id}`, { replace: true });
    } catch {
      // handled by startError render below
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Choose a ritual</h1>

      {startError && (
        <div className="rounded-md border border-red-800/40 bg-red-900/20 p-3 text-sm text-red-300">
          Couldn’t start the session: {startError.message}
        </div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((r) => {
          const stepCount = r._count?.steps ?? 0;
          const disabled = isPending || stepCount === 0;

          return (
            <li key={r.id}>
              <button
                disabled={disabled}
                onClick={() => handleBegin(r.id)}
                className={`w-full rounded-2xl border bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <div className="font-semibold">{r.name}</div>
                <div className="text-xs text-gray-500">
                  {stepCount > 0 ? `${stepCount} steps` : "No steps configured"}
                </div>
                {isPending && (
                  <div className="mt-2 text-xs text-gray-400" aria-live="polite">
                    Preparing session…
                  </div>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
