import * as React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useMe } from "../features/auth/useMe";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useMe();
  const loc = useLocation();

  if (isLoading) return <div className="p-6 text-sm opacity-70">Loading…</div>;
  if (!data?.user) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  return <>{children}</>;
}
