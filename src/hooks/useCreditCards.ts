import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useHouseholdStore } from "../store/useHouseholdStore";

export function useCreditCards() {
  const householdId = useHouseholdStore((s) => s.householdId);
  return useQuery({
    queryKey: ["credit-cards", householdId],
    queryFn: () => api.listCreditCards(householdId!),
    enabled: !!householdId,
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["credit-cards"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateCreditCard() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; ownerMemberId: string | null; isShared: boolean }) =>
      api.createCreditCard(householdId!, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateCreditCard() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, payload }: { cardId: string; payload: { name?: string; ownerMemberId?: string | null; isShared?: boolean } }) =>
      api.updateCreditCard(householdId!, cardId, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteCreditCard() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cardId: string) => api.deleteCreditCard(householdId!, cardId),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useAddEmi() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      cardId,
      ...payload
    }: {
      cardId: string;
      itemName: string;
      monthlyAmount: number;
      remainingPayments: number;
      remainingAmount?: number | null;
    }) => api.addEmi(householdId!, cardId, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateEmi() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      emiId,
      payload,
    }: {
      emiId: string;
      payload: { itemName?: string; monthlyAmount?: number; remainingPayments?: number; remainingAmount?: number | null };
    }) => api.updateEmi(householdId!, emiId, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteEmi() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emiId: string) => api.deleteEmi(householdId!, emiId),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useRecordEmiPayment() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (emiId: string) => api.recordEmiPayment(householdId!, emiId),
    onSuccess: () => invalidate(queryClient),
  });
}
