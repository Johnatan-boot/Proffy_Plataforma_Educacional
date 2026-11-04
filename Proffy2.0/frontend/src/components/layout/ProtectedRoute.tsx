import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getSession } from "@/features/auth/session";

// Páginas administrativas exigem sessão ativa; sem ela, vai para o login.
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const location = useLocation();

  if (!getSession()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
