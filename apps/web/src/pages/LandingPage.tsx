export function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 text-center">
      <div className="space-y-6 max-w-lg px-4">
        <h1 className="text-4xl font-semibold tracking-tight">The Ritual Dataset</h1>
        <p className="text-neutral-400">
          A participatory study on altered states and collective anomalies.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <a
            href="/rituals"
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 transition rounded-lg font-medium"
          >
            Perform a Ritual
          </a>
          <a
            href="/research"
            className="px-6 py-3 border border-neutral-700 hover:border-neutral-500 transition rounded-lg font-medium"
          >
            View the Data
          </a>
        </div>

        <footer className="text-xs text-neutral-600 pt-10">
          build {typeof __BUILD_SHA__ === "string" ? __BUILD_SHA__.slice(0, 7) : "dev"}
        </footer>
      </div>
    </main>
  );
}
