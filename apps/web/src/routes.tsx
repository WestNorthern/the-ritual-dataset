import { createBrowserRouter, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { AppHome } from "./pages/AppHome";
import { ProtectedRoute } from "./routes/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", element: <Navigate to="/app" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  {
    path: "/app",
    element: (
      <ProtectedRoute>
        <AppHome />
      </ProtectedRoute>
    ),
  },
]);

