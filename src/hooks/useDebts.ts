import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useHouseholdStore } from "../store/useHouseholdStore";

export function useDebts() {
  const householdId = useHouseholdStore((s) => s.householdId);
  return useQuery({
    queryKey: ["debts", householdId],
    queryFn: () => api.listDebts(householdId!),
    enabled: !!householdId,
  });
}

function invalidateAfterDebtChange(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["debts"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateDebt() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => api.createDebt(householdId!, payload),
    onSuccess: () => invalidateAfterDebtChange(queryClient),
  });
}

export function useUpdateDebt() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ debtId, payload }: { debtId: string; payload: unknown }) => api.updateDebt(householdId!, debtId, payload),
    onSuccess: () => invalidateAfterDebtChange(queryClient),
  });
}

export function useDeleteDebt() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (debtId: string) => api.deleteDebt(householdId!, debtId),
    onSuccess: () => invalidateAfterDebtChange(queryClient),
  });
}

export function useRecordDebtPayment() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ debtId, status, paidOn }: { debtId: string; status: "paid" | "skipped" | "pending"; paidOn?: string }) =>
      api.recordDebtPayment(householdId!, debtId, { status, paidOn }),
    onSuccess: () => invalidateAfterDebtChange(queryClient),
  });
}

export function useCloseDebtEarly() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (debtId: string) => api.closeDebtEarly(householdId!, debtId),
    onSuccess: () => invalidateAfterDebtChange(queryClient),
  });
}
