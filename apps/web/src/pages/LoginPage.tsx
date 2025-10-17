import { Link, useSearchParams } from "react-router-dom";
import { LoginForm } from "../features/auth/LoginForm";

export function LoginPage() {
  const [sp] = useSearchParams();
  const next = sp.get("next") ?? "/app";
  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-xl font-semibold">Log in</h1>
      <LoginForm next={next} />
      <p className="text-sm">
        No account?{" "}
        <Link className="underline" to={`/register?next=${encodeURIComponent(next)}`}>
          Create one
        </Link>
      </p>
    </div>
  );
}
