import { Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute, OnboardingRoute, GuestRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/Layout";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Legal from "./pages/Legal";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Debts from "./pages/Debts";
import CreditCards from "./pages/CreditCards";
import Buckets from "./pages/Buckets";
import Expenses from "./pages/Expenses";
import Calendar from "./pages/Calendar";
import Household from "./pages/Household";

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Not wrapped in GuestRoute — the recovery-link flow establishes a
          temporary session, which would make GuestRoute redirect away before
          the user can actually set a new password. */}
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/legal" element={<Legal />} />

      <Route element={<OnboardingRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/credit-cards" element={<CreditCards />} />
          <Route path="/buckets" element={<Buckets />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/household" element={<Household />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
