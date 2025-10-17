import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { trpc } from "../lib/trpc";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: me, isLoading } = trpc.auth.me.useQuery(undefined, { retry: false });
  const loc = useLocation();

  if (isLoading) return <div className="p-6 text-sm opacity-70">Loading…</div>;

  if (!me) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  return <>{children}</>;
}
