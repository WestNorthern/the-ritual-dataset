type Step = {
  id: string;
  title: string | null;
  kind: string;
  record: boolean | null;
};

export function RitualOverview({
  purpose,
  requirements,
  steps,
  history,
  tab,
  setTab,
}: {
  purpose?: string | null;
  requirements?: string[] | null;
  steps: Step[];
  history?: string | null;
  tab: "guide" | "history";
  setTab: (t: "guide" | "history") => void;
}) {
  const reqs = requirements ?? [];

  return (
    <div className="mt-2 w-full max-w-2xl rounded-2xl border border-white/10 bg-black/40 p-3 text-left backdrop-blur">
      <div role="tablist" aria-label="Ritual info" className="mb-3 flex gap-2">
        <TabButton active={tab === "guide"} onClick={() => setTab("guide")}>Guide</TabButton>
        <TabButton active={tab === "history"} onClick={() => setTab("history")}>History</TabButton>
      </div>

      {tab === "guide" ? (
        <div role="tabpanel" className="space-y-4">
          {purpose && (
            <p className="text-sm text-white/80">
              <span className="font-semibold text-white">Purpose: </span>
              {purpose}
            </p>
          )}

          {reqs.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60">
                Requirements
              </div>
              <ul className="list-inside list-disc text-sm text-white/85">
                {reqs.map((r, idx) => <li key={idx}>{r}</li>)}
              </ul>
            </div>
          )}

          <div>
            <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-white/60">Steps</div>
            <ol className="list-inside list-decimal space-y-1 text-sm text-white/85">
              {steps.map((s) => (
                <li key={s.id}>
                  <span className="font-medium text-white">
                    {s.title ?? s.kind.replaceAll("_", " ").toLowerCase()}
                  </span>
                  {s.record && (
                    <span className="ml-2 rounded bg-white/10 px-2 py-0.5 text-xs">Recording</span>
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <div role="tabpanel" className="prose prose-invert max-w-none text-sm">
          {history ? (
            <p className="whitespace-pre-wrap">{history}</p>
          ) : (
            <p className="text-white/70">No history available for this ritual yet.</p>
          )}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      role="tab"
      aria-selected={active}
      className={`rounded-xl px-3 py-1 text-sm font-medium transition ${
        active ? "bg-white text-black" : "bg-white/10 text-white hover:bg-white/20"
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
