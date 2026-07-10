import { create } from "zustand";

interface HouseholdMember {
  id: string;
  displayName: string;
  avatarColor: string;
  monthlyIncome: number;
  role: string;
}

interface HouseholdState {
  householdId: string | null;
  members: HouseholdMember[];
  activeMemberId: string; // a member's id, or 'combined'
  setHousehold: (householdId: string, members: HouseholdMember[]) => void;
  setActiveMember: (memberId: string) => void;
  clearHousehold: () => void;
}

// This one piece of state — activeMemberId — is what every page/query filters
// by. Switching "Arjun" / "Meera" / "Combined" just changes this and every
// hook below re-fetches scoped to it. No prop drilling needed.
export const useHouseholdStore = create<HouseholdState>((set) => ({
  householdId: null,
  members: [],
  activeMemberId: "combined",
  setHousehold: (householdId, members) => set({ householdId, members }),
  setActiveMember: (memberId) => set({ activeMemberId: memberId }),
  clearHousehold: () => set({ householdId: null, members: [], activeMemberId: "combined" }),
}));
