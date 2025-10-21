// apps/web/src/pages/LandingPage.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth"; // whatever hook you use
import { sanitizeNext } from "../lib/next";

export function LandingPage() {
  const { me /*, isLoading */ } = useAuth();

  const next = sanitizeNext("/app/rituals/start");
  const startTo = me ? next : `/login?next=${encodeURIComponent(next)}`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-neutral-950 text-neutral-100 text-center">
      <div className="space-y-6 max-w-lg px-4">
        <h1 className="text-4xl font-semibold tracking-tight">The Ritual Dataset</h1>
        <p className="text-neutral-400">
          A participatory study on altered states and collective anomalies.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Link
            to={startTo}
            className="px-6 py-3 bg-rose-600 hover:bg-rose-500 transition rounded-lg font-medium"
            replace
          >
            Perform a Ritual
          </Link>

          <Link
            to="/research"
            className="px-6 py-3 border border-neutral-700 hover:border-neutral-500 transition rounded-lg font-medium"
            replace
          >
            View the Data
          </Link>
        </div>

        <footer className="text-xs text-neutral-600 pt-10">
          build {typeof __BUILD_SHA__ === "string" ? __BUILD_SHA__.slice(0, 7) : "dev"}
        </footer>
      </div>
    </main>
  );
}
