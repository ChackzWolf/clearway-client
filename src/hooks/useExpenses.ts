import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useHouseholdStore } from "../store/useHouseholdStore";

export function useExpenses() {
  const householdId = useHouseholdStore((s) => s.householdId);
  return useQuery({
    queryKey: ["expenses", householdId],
    queryFn: () => api.listExpenses(householdId!),
    enabled: !!householdId,
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["expenses"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateExpense() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => api.createExpense(householdId!, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateExpense() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, payload }: { expenseId: string; payload: unknown }) => api.updateExpense(householdId!, expenseId, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteExpense() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => api.deleteExpense(householdId!, expenseId),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useRecordExpensePayment() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => api.recordExpensePayment(householdId!, expenseId),
    onSuccess: () => invalidate(queryClient),
  });
}
