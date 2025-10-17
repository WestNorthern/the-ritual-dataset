import { useState } from "react";
import { trpc } from "../../lib/trpc";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const login = trpc.auth.loginLocal.useMutation();
  const me = trpc.auth.me.useQuery(undefined, { enabled: false });

  return (
    <form
      className="grid gap-3 max-w-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        await login.mutateAsync({ email, password });
        await me.refetch();
      }}
    >
      <input
        className="border p-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        className="p-2 rounded bg-black text-white disabled:opacity-50"
        disabled={login.isPending}
      >
        Log in
      </button>
      {login.error && <p className="text-red-600 text-sm">{login.error.message}</p>}
    </form>
  );
}
