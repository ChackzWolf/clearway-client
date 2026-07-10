import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useHouseholdStore } from "../store/useHouseholdStore";

export function useBuckets() {
  const householdId = useHouseholdStore((s) => s.householdId);
  return useQuery({
    queryKey: ["buckets", householdId],
    queryFn: () => api.listBuckets(householdId!),
    enabled: !!householdId,
  });
}

function invalidate(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: ["buckets"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
}

export function useCreateBucket() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: unknown) => api.createBucket(householdId!, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateBucket() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bucketId, payload }: { bucketId: string; payload: unknown }) => api.updateBucket(householdId!, bucketId, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteBucket() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bucketId: string) => api.deleteBucket(householdId!, bucketId),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useContributeBucket() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bucketId, amount, note }: { bucketId: string; amount: number; note?: string }) =>
      api.contributeBucket(householdId!, bucketId, { amount, note }),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useAddBucketLink() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bucketId, url, label, price }: { bucketId: string; url: string; label?: string; price?: number }) =>
      api.addBucketLink(householdId!, bucketId, { url, label: label || null, price: price ?? null }),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useUpdateBucketLink() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bucketId, linkId, payload }: { bucketId: string; linkId: string; payload: unknown }) =>
      api.updateBucketLink(householdId!, bucketId, linkId, payload),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useDeleteBucketLink() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bucketId, linkId }: { bucketId: string; linkId: string }) => api.deleteBucketLink(householdId!, bucketId, linkId),
    onSuccess: () => invalidate(queryClient),
  });
}

export function useRefreshBucketLink() {
  const householdId = useHouseholdStore((s) => s.householdId);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bucketId, linkId }: { bucketId: string; linkId: string }) => api.refreshBucketLink(householdId!, bucketId, linkId),
    onSuccess: () => invalidate(queryClient),
  });
}
