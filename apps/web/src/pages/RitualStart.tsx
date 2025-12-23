import { trpc } from "../lib/trpc";
import { useNavigate } from "react-router-dom";

export function RitualStart() {
  const navigate = useNavigate();

  // List rituals (API: id, name, slug, description, stepCount)
  const { data, isLoading, error: listError } = trpc.rituals.list.useQuery();

  // Start a session
  const {
    mutateAsync: startSession,
    isPending,
    error: startError,
    reset: resetStartError,
  } = trpc.sessions.start.useMutation();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Choose a ritual</h1>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-28 rounded-2xl border border-black/10 bg-white shadow-[0_3px_8px_rgba(0,0,0,0.06)]"
            />
          ))}
        </div>
      </div>
    );
  }

  if (listError) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Choose a ritual</h1>
        <div className="rounded-xl border border-black p-4 text-sm">
          <div className="font-semibold">Couldn’t load rituals.</div>
          <div className="opacity-70">{listError.message}</div>
        </div>
      </div>
    );
  }

  if (!data?.length) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight">Choose a ritual</h1>
        <div className="rounded-xl border border-black/10 bg-white p-6 shadow-[0_3px_8px_rgba(0,0,0,0.06)]">
          <div className="font-medium">No rituals available.</div>
          <div className="text-sm opacity-70">Please check back soon.</div>
        </div>
      </div>
    );
  }

  const handleBegin = async (ritualId: string) => {
    try {
      resetStartError();
      const s = await startSession({ ritualId }); // -> { id }
      navigate(`/app/run/${s.id}`, { replace: true });
    } catch {
      // handled below
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <h1 className="text-3xl font-semibold tracking-tight">Choose a ritual</h1>
        {/* optional: count */}
        <div className="text-sm opacity-60">{data.length} available</div>
      </div>

      {startError && (
        <div className="rounded-xl border border-black p-3 text-sm">
          <div className="font-semibold">Couldn’t start the session.</div>
          <div className="opacity-70">{startError.message}</div>
        </div>
      )}

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.map((r) => {
          const disabled = isPending || r.stepCount === 0;

          return (
            <li key={r.id}>
              <button
                disabled={disabled}
                onClick={() => handleBegin(r.id)}
                className={[
                  "group w-full rounded-2xl border border-black/10 bg-white p-4 text-left",
                  "shadow-[0_3px_8px_rgba(0,0,0,0.06)] transition",
                  !disabled && "hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)]",
                  disabled && "cursor-not-allowed opacity-60",
                ].join(" ")}
                aria-describedby={`r-${r.id}-meta`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold">{r.name}</div>
                  {r.stepCount > 0 ? (
                    <span className="rounded-full border border-black/20 px-2 py-0.5 text-xs">
                      {r.stepCount} steps
                    </span>
                  ) : (
                    <span className="rounded-full border border-black/20 px-2 py-0.5 text-xs">
                      coming soon
                    </span>
                  )}
                </div>

                {r.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{r.description}</p>
                )}

                <div id={`r-${r.id}-meta`} className="mt-2 text-xs opacity-60">
                  {isPending ? "Preparing session…" : "Tap to begin"}
                </div>

                {/* Primary affordance hint (keeps b/w, no color) */}
                <div className="mt-3 inline-block rounded-lg bg-black px-3 py-1 text-xs font-medium text-white shadow-[0_3px_8px_rgba(0,0,0,0.25)] group-hover:-translate-y-0.5 transition-transform">
                  Begin
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
