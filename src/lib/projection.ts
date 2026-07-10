// Shared "how many months left, and what will the bill look like each month"
// math for debts and credit card EMIs — both are just "amount for N more months".

export function estimateFinishMonth(remainingPayments: number, anchorDate?: string | null): string {
  if (remainingPayments <= 0) return "Completed";
  const base = anchorDate ? new Date(anchorDate) : new Date();
  // If we have a concrete next due date, that date IS payment #1 of the remaining
  // count, so only (remainingPayments - 1) more month-steps are needed from there.
  const monthsToAdd = anchorDate ? remainingPayments - 1 : remainingPayments;
  const d = new Date(base.getFullYear(), base.getMonth() + monthsToAdd, 1);
  return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

export interface ProjectableItem {
  amount: number;
  remainingPayments: number;
}

export interface ProjectedMonth {
  label: string;
  total: number;
}

// For each of the next `months` calendar months (starting this month), sums the
// amount of every item that still has a payment due that far out. As an item's
// remainingPayments run out, it silently drops out of later months — which is
// exactly how the real total monthly bill will shrink over time.
export function buildMonthlyProjection(items: ProjectableItem[], months = 6): ProjectedMonth[] {
  const now = new Date();
  return Array.from({ length: months }, (_, offset) => {
    const total = items.reduce((sum, it) => (it.remainingPayments > offset ? sum + it.amount : sum), 0);
    const date = new Date(now.getFullYear(), now.getMonth() + offset, 1);
    return { label: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }), total };
  });
}
