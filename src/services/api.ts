import { getAccessToken } from "./supabaseClient";

const BASE_URL = import.meta.env.VITE_API_URL as string; // e.g. https://clearway-api.up.railway.app

async function request(path: string, options: RequestInit = {}) {
  const token = await getAccessToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  createHousehold: (payload: { name: string; displayName: string; monthlyIncome?: number }) =>
    request(`/households`, { method: "POST", body: JSON.stringify(payload) }),
  addProfileMember: (householdId: string, payload: unknown) =>
    request(`/households/${householdId}/members`, { method: "POST", body: JSON.stringify(payload) }),
  updateMember: (householdId: string, memberId: string, payload: unknown) =>
    request(`/households/${householdId}/members/${memberId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteMember: (householdId: string, memberId: string) =>
    request(`/households/${householdId}/members/${memberId}`, { method: "DELETE" }),

  getDashboard: (householdId: string, memberId: string) =>
    request(`/households/${householdId}/dashboard?memberId=${memberId}`),

  listDebts: (householdId: string) => request(`/households/${householdId}/debts`),
  createDebt: (householdId: string, payload: unknown) =>
    request(`/households/${householdId}/debts`, { method: "POST", body: JSON.stringify(payload) }),
  updateDebt: (householdId: string, debtId: string, payload: unknown) =>
    request(`/households/${householdId}/debts/${debtId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteDebt: (householdId: string, debtId: string) =>
    request(`/households/${householdId}/debts/${debtId}`, { method: "DELETE" }),
  recordDebtPayment: (householdId: string, debtId: string, payload: unknown) =>
    request(`/households/${householdId}/debts/${debtId}/payments`, { method: "POST", body: JSON.stringify(payload) }),
  closeDebtEarly: (householdId: string, debtId: string) =>
    request(`/households/${householdId}/debts/${debtId}/close-early`, { method: "POST" }),

  listCreditCards: (householdId: string) => request(`/households/${householdId}/credit-cards`),
  createCreditCard: (householdId: string, payload: unknown) =>
    request(`/households/${householdId}/credit-cards`, { method: "POST", body: JSON.stringify(payload) }),
  updateCreditCard: (householdId: string, cardId: string, payload: unknown) =>
    request(`/households/${householdId}/credit-cards/${cardId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteCreditCard: (householdId: string, cardId: string) =>
    request(`/households/${householdId}/credit-cards/${cardId}`, { method: "DELETE" }),
  addEmi: (householdId: string, cardId: string, payload: unknown) =>
    request(`/households/${householdId}/credit-cards/${cardId}/emis`, { method: "POST", body: JSON.stringify(payload) }),
  updateEmi: (householdId: string, emiId: string, payload: unknown) =>
    request(`/households/${householdId}/credit-cards/emis/${emiId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteEmi: (householdId: string, emiId: string) =>
    request(`/households/${householdId}/credit-cards/emis/${emiId}`, { method: "DELETE" }),
  recordEmiPayment: (householdId: string, emiId: string) =>
    request(`/households/${householdId}/credit-cards/emis/${emiId}/payments`, { method: "POST" }),

  listBuckets: (householdId: string) => request(`/households/${householdId}/buckets`),
  createBucket: (householdId: string, payload: unknown) =>
    request(`/households/${householdId}/buckets`, { method: "POST", body: JSON.stringify(payload) }),
  updateBucket: (householdId: string, bucketId: string, payload: unknown) =>
    request(`/households/${householdId}/buckets/${bucketId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteBucket: (householdId: string, bucketId: string) =>
    request(`/households/${householdId}/buckets/${bucketId}`, { method: "DELETE" }),
  contributeBucket: (householdId: string, bucketId: string, payload: { amount: number; note?: string }) =>
    request(`/households/${householdId}/buckets/${bucketId}/contributions`, { method: "POST", body: JSON.stringify(payload) }),
  addBucketLink: (householdId: string, bucketId: string, payload: { url: string; label?: string | null; price?: number | null }) =>
    request(`/households/${householdId}/buckets/${bucketId}/links`, { method: "POST", body: JSON.stringify(payload) }),
  updateBucketLink: (householdId: string, bucketId: string, linkId: string, payload: unknown) =>
    request(`/households/${householdId}/buckets/${bucketId}/links/${linkId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteBucketLink: (householdId: string, bucketId: string, linkId: string) =>
    request(`/households/${householdId}/buckets/${bucketId}/links/${linkId}`, { method: "DELETE" }),
  refreshBucketLink: (householdId: string, bucketId: string, linkId: string) =>
    request(`/households/${householdId}/buckets/${bucketId}/links/${linkId}/refresh`, { method: "POST" }),
  allocateFreedMoney: (householdId: string, payload: unknown) =>
    request(`/households/${householdId}/buckets/allocate-freed-money`, { method: "POST", body: JSON.stringify(payload) }),

  listExpenses: (householdId: string) => request(`/households/${householdId}/expenses`),
  createExpense: (householdId: string, payload: unknown) =>
    request(`/households/${householdId}/expenses`, { method: "POST", body: JSON.stringify(payload) }),
  updateExpense: (householdId: string, expenseId: string, payload: unknown) =>
    request(`/households/${householdId}/expenses/${expenseId}`, { method: "PATCH", body: JSON.stringify(payload) }),
  deleteExpense: (householdId: string, expenseId: string) =>
    request(`/households/${householdId}/expenses/${expenseId}`, { method: "DELETE" }),
  recordExpensePayment: (householdId: string, expenseId: string) =>
    request(`/households/${householdId}/expenses/${expenseId}/payments`, { method: "POST" }),
};
