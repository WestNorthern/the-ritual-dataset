import { LoginForm } from "../features/auth/LoginForm";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import { sanitizeNext } from "../lib/next";

export function LoginPage() {
  const [sp] = useSearchParams();
  const next = sanitizeNext(sp.get("next") ?? "/app");
  const { me, isLoading } = useAuth();

  if (!isLoading && me) return <Navigate to={next} replace />;

  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-xl font-semibold">Log in</h1>
      <LoginForm next={next} />
      {/* ... */}
    </div>
  );
}
