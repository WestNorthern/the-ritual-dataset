import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { trpc } from "../lib/trpc";
import { useAuth } from "../features/auth/useAuth";
import { sanitizeNext } from "../lib/next";

type NavItem = { to: string; label: string; end?: boolean };

export function NavBar({
  items = [
    { to: "/app", label: "Home", end: true },          // ✅ exact match only
    { to: "/app/rituals/start", label: "Rituals" },
  ] as NavItem[],
}) {
  const { me, isLoading } = useAuth();
  const utils = trpc.useUtils();
  const navigate = useNavigate();
  const location = useLocation();

  const logout = trpc.auth.logout.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${sanitizeNext(next)}`, { replace: true });
    },
  });

  // state-driven menu (works for hover + touch)
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const hoverTimer = useRef<number | null>(null);

  // outside click / Esc to close
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!open) return;
      const t = e.target as Node;
      if (rootRef.current?.contains(t)) return;
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

  // hover helpers (small delay for nicer feel)
  const openSoon = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(true), 60) as unknown as number;
  };
  const closeSoon = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(false), 120) as unknown as number;
  };

  return (
    <header className="sticky top-0 z-40 border-b border-black/10 bg-white/90 backdrop-blur transition-transform duration-300 will-change-transform">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        {/* Brand + primary links */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-base font-semibold tracking-tight hover:opacity-80 transition"
          >
            The Ritual Dataset
          </Link>

          <ul className="hidden gap-4 md:flex">
            {items.map((it) => (
              <li key={it.to}>
                <NavLink
                  to={it.to}
                  end={it.end} // ✅ exact match (Home)
                  className={({ isActive }) =>
                    [
                      "rounded-md px-2 py-1 text-sm font-medium transition",
                      isActive
                        ? "bg-black text-white shadow-[0_3px_8px_rgba(0,0,0,0.15)]"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")
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
            <div
              ref={rootRef}
              className="relative"
              onMouseEnter={openSoon}
              onMouseLeave={closeSoon}
            >
              <button
                ref={btnRef}
                type="button"
                onClick={() => setOpen((v) => !v)} // touch/click toggle
                className="flex items-center gap-2 rounded-full border border-black/10 bg-white px-2 py-1 shadow-[0_3px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_6px_16px_rgba(0,0,0,0.12)] transition"
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
                  className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-black/10 bg-white p-1 shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
                  onMouseEnter={openSoon}
                  onMouseLeave={closeSoon}
                >
                  {/* caret (top-center-ish) */}
                  <div className="pointer-events-none absolute -top-2 right-6 h-2 w-2 rotate-45 border-l border-t border-black/10 bg-white" />

                  <MenuItem to="/app">Dashboard</MenuItem>
                  <MenuItem to="/app/profile">Profile</MenuItem>
                  <div className="my-1 border-t border-black/10" />
                  <button
                    role="menuitem"
                    className="w-full rounded-lg px-3 py-2 text-left text-black hover:bg-gray-100 disabled:opacity-50"
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
                className="rounded-md px-3 py-1 text-sm hover:bg-gray-100 transition"
              >
                Log in
              </Link>
              <Link
                to={`/register?next=${encodeURIComponent(
                  sanitizeNext(location.pathname + location.search),
                )}`}
                className="rounded-md bg-black px-3 py-1 text-sm text-white shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition hover:scale-[1.02]"
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
    <div className="grid h-8 w-8 place-items-center rounded-full bg-black text-sm font-semibold text-white">
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
