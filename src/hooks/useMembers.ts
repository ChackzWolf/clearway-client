import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useHouseholdStore } from "../store/useHouseholdStore";
import { useAuth } from "../context/AuthContext";

export function useAddMember() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const { refreshHousehold } = useAuth();
  return useMutation({
    mutationFn: (payload: { displayName: string; monthlyIncome?: number; avatarColor?: string }) =>
      api.addProfileMember(householdId!, payload),
    onSuccess: () => refreshHousehold(),
  });
}

export function useUpdateMember() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const { refreshHousehold } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, payload }: { memberId: string; payload: { displayName?: string; monthlyIncome?: number; avatarColor?: string } }) =>
      api.updateMember(householdId!, memberId, payload),
    onSuccess: async () => {
      await refreshHousehold();
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

export function useDeleteMember() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const { refreshHousehold } = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => api.deleteMember(householdId!, memberId),
    onSuccess: async () => {
      await refreshHousehold();
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
