import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { sanitizeNext } from "../lib/next";

export function LandingPage() {
  const { me } = useAuth();

  const next = sanitizeNext("/app/rituals/start");
  const startTo = me ? next : `/login?next=${encodeURIComponent(next)}`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-black text-center">
      <div className="space-y-8 max-w-lg px-6">
        <h1 className="text-5xl font-semibold tracking-tight leading-tight">
          The Ritual Dataset
        </h1>

        <p className="text-gray-600 text-base">
          A participatory study of presence, pattern, and collective anomaly.
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
          {/* Primary CTA — black button, subtle lift */}
          <Link
            to={startTo}
            replace
            className="rounded-xl bg-black px-6 py-3 font-medium text-white shadow-[0_3px_8px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.35)] transition-transform focus:outline-none focus:ring-2 focus:ring-black"
          >
            Perform a Ritual
          </Link>

          {/* Secondary CTA — minimalist border button */}
          <Link
            to="/research"
            replace
            className="rounded-xl border border-gray-400 px-6 py-3 font-medium text-black hover:bg-black hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            View the Data
          </Link>
        </div>
      </div>
    </main>
  );
}