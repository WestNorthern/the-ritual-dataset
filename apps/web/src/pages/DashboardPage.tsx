// apps/web/src/pages/DashboardPage.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";

export function DashboardPage() {
  const { me, isLoading } = useAuth();

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-2xl border bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-semibold">
          {isLoading ? "Loading…" : `Welcome, ${me?.alias ?? "Witness"}`}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          Run a ritual, record your silence, submit your survey. Let’s gather evidence.
        </p>
      </header>

      {/* Quick actions */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <ActionCard
          to="/app/rituals"
          title="Run a Ritual"
          description="Choose a ritual and start a new session."
        />
        <ActionCard
          to="/app/sessions"
          title="Your Sessions"
          description="Review recordings & survey responses."
        />
        <ActionCard
          to="/app/profile"
          title="Profile"
          description="Update your alias and preferences."
        />
      </section>

      {/* Placeholder metrics (wire later) */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Sessions" value="—" hint="(coming soon)" />
        <StatCard label="Avg. Presence" value="—" hint="(coming soon)" />
        <StatCard label="Completion %" value="—" hint="(coming soon)" />
        <StatCard label="This Week" value="—" hint="(coming soon)" />
      </section>

      {/* Empty state / guide */}
      <section className="rounded-2xl border bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Get started</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-gray-700">
          <li>
            Pick a ritual on the{" "}
            <Link className="underline" to="/app/rituals">
              Rituals
            </Link>{" "}
            page.
          </li>
          <li>Follow the steps. When it says “Silence,” stay quiet while we record.</li>
          <li>
            Submit the short survey. Your session appears under{" "}
            <Link className="underline" to="/app/sessions">
              Sessions
            </Link>
            .
          </li>
        </ol>
      </section>
    </div>
  );
}

function ActionCard(props: { to: string; title: string; description: string }) {
  return (
    <Link
      to={props.to}
      className="block rounded-2xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="text-base font-semibold">{props.title}</div>
      <div className="mt-1 text-sm text-gray-600">{props.description}</div>
    </Link>
  );
}

function StatCard(props: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="text-sm text-gray-600">{props.label}</div>
      <div className="mt-1 text-2xl font-semibold">{props.value}</div>
      {props.hint && <div className="mt-1 text-xs text-gray-400">{props.hint}</div>}
    </div>
  );
}
