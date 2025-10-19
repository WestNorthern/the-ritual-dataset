// apps/web/src/components/NavBar.tsx
import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { useAuth } from "../features/auth/useAuth";
import { sanitizeNext } from "../lib/next";

type NavItem = { to: string; label: string };

export function NavBar({
  items = [
    { to: "/app", label: "Home" },
    { to: "/app/rituals", label: "Rituals" }, // add/remove as you create routes
  ] as NavItem[],
}) {
  const { me, isLoading } = useAuth();
  const utils = trpc.useUtils();
  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${sanitizeNext(next)}`, { replace: true });
    },
  });

  const navigate = useNavigate();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand + primary links */}
        <div className="flex items-center gap-3">
          <Link to="/" className="text-base font-semibold tracking-tight">
            The Ritual Dataset
          </Link>
          <ul className="hidden gap-4 md:flex">
            {items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  className={({ isActive }) =>
                    `rounded px-2 py-1 text-sm ${
                      isActive ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"
                    }`
                  }
                >
                  {it.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        {/* Auth side */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <span className="text-sm text-gray-500">Loading…</span>
          ) : me ? (
            <div className="relative">
              <button
                ref={btnRef}
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border px-2 py-1"
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls="account-menu"
              >
                <Avatar name={me.fullName ?? me.alias} />
                <span className="hidden text-sm md:inline">{me.alias}</span>
              </button>
              {open && (
                <div
                  id="account-menu"
                  ref={menuRef}
                  role="menu"
                  className="absolute right-0 mt-2 w-48 rounded-xl border bg-white p-1 shadow-lg"
                >
                  <MenuItem to="/app">Dashboard</MenuItem>
                  <MenuItem to={`/app/profile`}>Profile</MenuItem>
                  <div className="my-1 border-t" />
                  <button
                    role="menuitem"
                    className="w-full rounded-lg px-3 py-2 text-left text-red-700 hover:bg-red-50 disabled:opacity-50"
                    onClick={() => logout.mutate()}
                    disabled={logout.isPending}
                  >
                    {logout.isPending ? "Logging out…" : "Log out"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to={`/login?next=${encodeURIComponent(
                  sanitizeNext(location.pathname + location.search),
                )}`}
                className="rounded px-3 py-1 text-sm hover:bg-gray-100"
              >
                Log in
              </Link>
              <Link
                to={`/register?next=${encodeURIComponent(
                  sanitizeNext(location.pathname + location.search),
                )}`}
                className="rounded bg-black px-3 py-1 text-sm text-white"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function Avatar({ name }: { name: string }) {
  const letter = (name?.trim()?.[0] ?? "?").toUpperCase();
  return (
    <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-900 text-sm font-semibold text-white">
      {letter}
    </div>
  );
}

function MenuItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link role="menuitem" to={to} className="block rounded-lg px-3 py-2 text-sm hover:bg-gray-100">
      {children}
    </Link>
  );
}
