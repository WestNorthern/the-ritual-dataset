import { MeBadge } from "../features/auth/MeBadge";
export function AppHome() {
  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">The Ritual Dataset</h1>
        <MeBadge />
      </header>
      <main className="prose dark:prose-invert">
        <p>Welcome! Pick a ritual to begin…</p>
      </main>
    </div>
  );
}
