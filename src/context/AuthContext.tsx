import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, signOut as supabaseSignOut } from "../services/supabaseClient";
import { useHouseholdStore } from "../store/useHouseholdStore";

interface AuthContextValue {
  session: Session | null;
  authLoading: boolean;
  householdLoading: boolean;
  hasHousehold: boolean;
  signOut: () => Promise<void>;
  refreshHousehold: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Households aren't fetched through the Express API (there's no "list my
// households" route) — RLS already lets an authenticated user see only the
// households they belong to, so we query Supabase directly here.
async function fetchMyHousehold() {
  const { data, error } = await supabase
    .from("households")
    .select("id, name, household_members(id, display_name, avatar_color, monthly_income, role)")
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [householdLoading, setHouseholdLoading] = useState(true);
  const setHousehold = useHouseholdStore((s) => s.setHousehold);
  const clearHousehold = useHouseholdStore((s) => s.clearHousehold);
  const householdId = useHouseholdStore((s) => s.householdId);

  async function loadHousehold() {
    setHouseholdLoading(true);
    try {
      const household = await fetchMyHousehold();
      if (household) {
        setHousehold(
          household.id,
          (household.household_members || []).map((m: any) => ({
            id: m.id,
            displayName: m.display_name,
            avatarColor: m.avatar_color,
            monthlyIncome: Number(m.monthly_income || 0),
            role: m.role,
          }))
        );
      } else {
        clearHousehold();
      }
    } catch {
      clearHousehold();
    } finally {
      setHouseholdLoading(false);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      clearHousehold();
      setHouseholdLoading(false);
      return;
    }
    loadHousehold();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user.id]);

  async function signOut() {
    await supabaseSignOut();
    clearHousehold();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        authLoading,
        householdLoading,
        hasHousehold: !!householdId,
        signOut,
        refreshHousehold: loadHousehold,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
