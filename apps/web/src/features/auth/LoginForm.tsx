import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../../lib/trpc";
import { sanitizeNext } from "../../lib/next";

type LoginFormProps = { next?: string };

export function LoginForm({ next = "/app" }: LoginFormProps) {
  const navigate = useNavigate();
  const utils = trpc.useUtils(); // for cache invalidation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = trpc.auth.loginLocal.useMutation({
    onSuccess: async () => {
      // mark me as stale so ProtectedRoute/App re-fetch sees the cookie session
      await utils.auth.me.invalidate();
      navigate(sanitizeNext(next), { replace: true });
    },
  });

  return (
    <form
      className="grid gap-3 max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        login.mutate({ email, password });
      }}
    >
      <input
        className="border p-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        autoComplete="email"
      />
      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        autoComplete="current-password"
      />
      <button
        type="submit"
        className="p-2 rounded bg-black text-white disabled:opacity-50"
        disabled={login.isPending}
        aria-busy={login.isPending}
      >
        {login.isPending ? "Logging in…" : "Log in"}
      </button>

      {login.error && (
        <p className="text-red-600 text-sm" role="alert">
          {login.error.message}
        </p>
      )}
    </form>
  );
}
