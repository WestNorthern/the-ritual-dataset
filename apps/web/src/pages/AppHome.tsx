import { NavBar } from "../components/NavBar";
import { Outlet } from "react-router-dom";

export function AppHome() {
  return (
    <div className="min-h-dvh bg-gray-50">
      <NavBar />
      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
