import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useHouseholdStore } from "../store/useHouseholdStore";

export function useDashboard() {
  const { householdId, activeMemberId } = useHouseholdStore();
  return useQuery({
    queryKey: ["dashboard", householdId, activeMemberId],
    queryFn: () => api.getDashboard(householdId!, activeMemberId),
    enabled: !!householdId,
  });
}

export function useAllocateFreedMoney() {
  const { householdId } = useHouseholdStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      debtId: string;
      choice: "bucket" | "split" | "new_bucket" | "skip";
      targetBucketId?: string;
      newBucketName?: string;
    }) => api.allocateFreedMoney(householdId!, payload),
    onSuccess: () => {
      // Freed-money allocation touches debts + buckets + the dashboard totals —
      // simplest correct approach is to invalidate all three rather than
      // hand-patch the cache in three places.
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["debts"] });
      queryClient.invalidateQueries({ queryKey: ["buckets"] });
    },
  });
}
