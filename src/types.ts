// These mirror the backend's data shapes. Kept here directly (rather than a
// cross-repo import) since the frontend and backend live in separate repos.

export type PaymentRule = "pay_extra_anytime" | "close_anytime" | "fixed_schedule";
export type DebtStatus = "active" | "completed";
export type PaymentStatus = "paid" | "skipped" | "pending";
export type Priority = "High" | "Medium" | "Low";

export interface HouseholdMember {
  id: string;
  householdId: string;
  authUserId: string | null;
  displayName: string;
  avatarColor: string;
  monthlyIncome: number;
  role: "owner" | "member" | "viewer";
}

export interface Household {
  id: string;
  name: string;
  createdBy: string;
  members: HouseholdMember[];
}

export interface Debt {
  id: string;
  householdId: string;
  ownerMemberId: string | null; // null = shared/joint
  isShared: boolean;
  name: string;
  category: string;
  monthlyPayment: number;
  remainingPayments: number;
  nextDueDate: string | null;
  paymentRule: PaymentRule;
  notes: string | null;
  status: DebtStatus;
  freedAmountAllocated: boolean;
}

export interface CreditCardEmi {
  id: string;
  creditCardId: string;
  itemName: string;
  monthlyAmount: number;
  remainingPayments: number;
  status: DebtStatus;
}

export interface CreditCard {
  id: string;
  householdId: string;
  ownerMemberId: string | null;
  isShared: boolean;
  name: string;
  emis: CreditCardEmi[];
  monthlyDue: number; // derived: sum of active emis, never persisted
}

export interface Bucket {
  id: string;
  householdId: string;
  ownerMemberId: string | null;
  isShared: boolean;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  priority: Priority;
  deadline: string | null;
  monthlyContribution: number;
  isCompleted: boolean;
}

export interface DashboardSummary {
  scope: "member" | "household";
  income: number;
  monthlyPayments: number;
  monthlySavings: number;
  freeMoney: number;
  activeDebtCount: number;
  upcomingPayments: Array<{ id: string; name: string; amount: number; dueDate: string | null }>;
  buckets: Bucket[];
}

export interface FreedMoneyAllocationRequest {
  debtId: string;
  choice: "bucket" | "split" | "new_bucket" | "skip";
  targetBucketId?: string;
  newBucketName?: string;
}
