// src/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute() {
  const { user } = useAuth();

  // If the user is logged in, the <Outlet> component will render the correct
  // child route (e.g., Dashboard, Search, etc.).
  if (user) {
    return <Outlet />;
  }

  // If the user is not logged in, they are redirected to the home/login page.
  return <Navigate to="/" replace />;
}