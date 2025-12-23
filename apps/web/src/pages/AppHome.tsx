import { NavBar } from "../components/NavBar";
import { Outlet, useLocation } from "react-router-dom";

export function AppHome() {
  const { pathname } = useLocation();
  const isRunner = pathname.startsWith("/app/session/"); // adjust to your route

  return (
    <div className="app-shell grid min-h-dvh grid-rows-[auto,1fr,auto] bg-surface-light text-text-light transition-colors duration-700">
      <header className="row-start-1">
        <NavBar />
      </header>

      <main
        className={[
          "app-main relative row-start-2 min-h-0", // min-h-0 lets children with absolute/overflow size correctly
          isRunner ? "mx-0 w-full max-w-none p-0 h-full" : "mx-auto w-full max-w-6xl p-6 md:p-8",
          // in immersive, also ensure full height (harmless if already full-bleed)
          "[.immersive_&]:h-full",
        ].join(" ")}
      >
        <Outlet />
      </main>

      {/* hide footer in immersive */}
      <footer className="row-start-3 border-t border-black/5 px-4 py-3 text-center text-xs text-gray-500 tracking-wide [.immersive_&]:hidden">
        build {typeof __BUILD_SHA__ === "string" ? __BUILD_SHA__.slice(0, 7) : "dev"}
        <span className="inline-block pl-2 opacity-60">•</span>
        <span className="inline-block pl-2">© The Ritual Dataset</span>
        <div className="pt-[env(safe-area-inset-bottom)]" />
      </footer>
    </div>
  );
}