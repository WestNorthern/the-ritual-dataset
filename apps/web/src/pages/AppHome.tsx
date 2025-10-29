import { NavBar } from "../components/NavBar";
import { Outlet } from "react-router-dom";

export function AppHome() {
  return (
    <div className="app-shell flex min-h-dvh flex-col bg-surface-light text-text-light transition-colors duration-700">
      <NavBar />
      <main className="app-main mx-auto w-full max-w-6xl flex-1 p-6 md:p-8">
        <Outlet />
      </main>
    </div>
  );
}
