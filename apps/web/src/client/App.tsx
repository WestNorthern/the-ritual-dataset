export function App() {
  const sha = typeof __BUILD_SHA__ === "string" ? __BUILD_SHA__ : "dev";

  return (
    <main className="min-h-dvh bg-white text-black">
      {/* top bar */}
      <header className="border-b border-zinc-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-black tracking-tight">The Ritual Dataset</span>
          <nav className="hidden gap-6 text-sm text-zinc-600 md:flex">
            <a className="hover:text-black" href="#">Rituals</a>
            <a className="hover:text-black" href="#">Sessions</a>
            <a className="hover:text-black" href="#">Docs</a>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="text-4xl font-black tracking-tight md:text-5xl">
              A data-first study of ritual experiences
            </h1>
            <p className="mt-4 text-lg text-zinc-600">
              Run a ritual, record a measured window of silence, then submit a short survey.
              Structured results enable aggregate analysis for potential anomalies.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="h-11 rounded-2xl bg-black px-5 font-medium text-white transition hover:opacity-90">
                Start a Session
              </button>
              <button className="h-11 rounded-2xl border border-zinc-300 px-5 font-medium text-black transition hover:bg-zinc-50">
                Browse Rituals
              </button>
              <button className="h-11 rounded-2xl px-5 font-medium text-zinc-700 underline-offset-4 hover:underline">
                Read the Docs
              </button>
            </div>

            <div className="mt-6 flex items-center gap-3 text-sm text-zinc-600">
              <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[var(--color-volt,#ceff00)]"></span>
              Ready for Step 1 — domain modeling
            </div>
          </div>

          {/* visual card */}
          <div className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <div className="text-sm font-medium text-zinc-500">Runner Preview</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-zinc-100 p-4">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Step</div>
                <div className="mt-1 text-lg font-semibold">Invocation</div>
                <p className="mt-2 text-sm text-zinc-600">
                  Speak the words as shown. Remain calm and focused.
                </p>
              </div>
              <div className="rounded-lg bg-zinc-100 p-4">
                <div className="text-xs uppercase tracking-wide text-zinc-500">Silence Window</div>
                <div className="mt-1 text-2xl font-bold tabular-nums">00:30</div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded bg-zinc-200">
                  <div className="h-full w-1/3 bg-[var(--color-volt,#ceff00)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* feature bullets */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-zinc-200 p-6">
            <h3 className="font-semibold">Scripted Steps</h3>
            <p className="mt-2 text-sm text-zinc-600">Preparation → Invocation → Silence → Closing.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-6">
            <h3 className="font-semibold">Measured Silence</h3>
            <p className="mt-2 text-sm text-zinc-600">Record audio and capture metadata during a fixed window.</p>
          </div>
          <div className="rounded-2xl border border-zinc-200 p-6">
            <h3 className="font-semibold">Survey & Evidence</h3>
            <p className="mt-2 text-sm text-zinc-600">Store Presence Ratings and notes for aggregate reporting.</p>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-zinc-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6 text-sm text-zinc-600">
          <span>© {new Date().getFullYear()} The Ritual Dataset</span>
          <span>
            build <span className="font-mono">{sha.slice(0, 7)}</span>
          </span>
        </div>
      </footer>
    </main>
  );
}
