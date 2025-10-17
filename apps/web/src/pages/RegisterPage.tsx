import { Link, useSearchParams } from "react-router-dom";
import { RegisterForm } from "../features/auth/RegisterForm";

export function RegisterPage() {
  const [sp] = useSearchParams();
  const next = sp.get("next") ?? "/app";
  return (
    <div className="mx-auto max-w-md p-6 space-y-4">
      <h1 className="text-xl font-semibold">Create account</h1>
      <RegisterForm next={next} />
      <p className="text-sm">
        Already have an account?{" "}
        <Link className="underline" to={`/login?next=${encodeURIComponent(next)}`}>
          Log in
        </Link>
      </p>
    </div>
  );
}
