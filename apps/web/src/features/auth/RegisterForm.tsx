import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { trpc } from "../../lib/trpc";
import { sanitizeNext } from "../../lib/next";

type RegisterFormProps = { next?: string };

export function RegisterForm({ next = "/app" }: RegisterFormProps) {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const [alias, setAlias] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = trpc.auth.registerLocal.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate(sanitizeNext(next), { replace: true });
    },
  });

  return (
    <form
      className="grid gap-3 max-w-sm"
      onSubmit={(e) => {
        e.preventDefault();
        register.mutate({ alias, fullName: fullName || undefined, email, password });
      }}
    >
      <input
        className="border p-2 rounded"
        placeholder="Alias"
        value={alias}
        onChange={(e) => setAlias(e.target.value)}
        required
        autoComplete="username"
      />
      <input
        className="border p-2 rounded"
        placeholder="Full name (optional)"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
      />
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
        placeholder="Password (min 12 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={12}
        autoComplete="new-password"
      />
      <button
        type="submit"
        className="p-2 rounded bg-black text-white disabled:opacity-50"
        disabled={register.isPending}
        aria-busy={register.isPending}
      >
        {register.isPending ? "Creating…" : "Create account"}
      </button>

      {register.error && <p className="text-red-600 text-sm" role="alert">{register.error.message}</p>}
    </form>
  );
}
