// apps/web/src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AppHome } from "./pages/AppHome";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RitualStart } from "./pages/RitualStart";
import { SessionRunner } from "./pages/SessionRunner";

export const router = createBrowserRouter([
  // PUBLIC layout at "/"
  {
    path: "/",
    element: <AppHome />, // renders NavBar + <Outlet />
    children: [
      { index: true, element: <LandingPage /> }, // -> "/"
      // You can add other public pages here too:
      // { path: "about", element: <AboutPage /> },    // -> "/about"
    ],
  },

  // AUTH pages that don't need the app shell
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },

  // PRIVATE layout at "/app"
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppHome /> {/* same shell, but behind auth */}
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "rituals/start", element: <RitualStart /> },
      { path: "run/:sessionId", element: <SessionRunner /> },
    ],
  },
]);
