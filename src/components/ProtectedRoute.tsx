import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LoadingScreen } from "./LoadingScreen";

export function ProtectedRoute() {
  const { session, authLoading, householdLoading, hasHousehold } = useAuth();

  if (authLoading || (session && householdLoading)) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  if (!hasHousehold) return <Navigate to="/onboarding" replace />;

  return <Outlet />;
}

export function OnboardingRoute() {
  const { session, authLoading, householdLoading, hasHousehold } = useAuth();

  if (authLoading || (session && householdLoading)) return <LoadingScreen />;
  if (!session) return <Navigate to="/login" replace />;
  if (hasHousehold) return <Navigate to="/" replace />;

  return <Outlet />;
}

export function GuestRoute() {
  const { session, authLoading, householdLoading, hasHousehold } = useAuth();

  if (authLoading) return <LoadingScreen />;
  if (session && !householdLoading) return <Navigate to={hasHousehold ? "/" : "/onboarding"} replace />;

  return <Outlet />;
}
