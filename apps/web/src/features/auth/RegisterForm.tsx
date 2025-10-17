import { useState } from "react";
import { trpc } from "../../lib/trpc";

export default function RegisterForm() {
  const [alias, setAlias] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const register = trpc.auth.registerLocal.useMutation();

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
      />
      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Password (min 12 chars)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button
        className="p-2 rounded bg-black text-white disabled:opacity-50"
        disabled={register.isPending}
      >
        Create account
      </button>
      {register.error && <p className="text-red-600 text-sm">{register.error.message}</p>}
      {register.isSuccess && <p className="text-green-700 text-sm">Account created!</p>}
    </form>
  );
}
