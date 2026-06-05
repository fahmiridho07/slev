export type SpendingContext = string;

export type EntryType = "expense" | "income";

export type SpendingMoment = {
  id: string;
  amount: number;
  occurredAt: string;
  label?: string;
  context: SpendingContext;
  note?: string;
  type: EntryType;
  source?: string;
  accountLabel?: string;
  createdAt: string;
  updatedAt: string;
};

export type MoneyAccount = {
  id: string;
  label: string;
  kind: "bank" | "wallet" | "cash" | "other";
  isIncomeHub: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MoneyTransfer = {
  id: string;
  amount: number;
  fromAccount: string;
  toAccount: string;
  occurredAt: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpenseCategory = {
  id: string;
  label: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type BudgetPeriod = "weekly" | "monthly";

export type BudgetLimit = {
  category: string;
  limitAmount: number;
  period: BudgetPeriod;
};

export type CategoryMode = {
  category: string;
  mode: "fixed" | "flexible";
};

export type MonthlyPlan = {
  id: string;
  month: string;
  expectedIncome: number;
  fixedCosts: number;
  flexibleBudget: number;
  savingsTarget: number;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type ManualTemplate = SpendingMoment;

export type SavingsGoal = {
  id: string;
  label: string;
  targetAmount: number;
  savedAmount: number;
  createdAt: string;
  updatedAt: string;
};

export type BalanceSnapshot = {
  id: string;
  accountLabel: string;
  amount: number;
  snapshotDate: string;
  createdAt: string;
};

export type MonthlyClosing = {
  id: string;
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  nextMonthAdjustment?: string;
  createdAt: string;
};

export type PatternFeedbackResponse = "keep" | "less_often" | "not_sure";

export type PatternFeedback = {
  patternId: string;
  response: PatternFeedbackResponse;
  createdAt: string;
};

export type PatternGroup =
  | "Repeated lately"
  | "Stands out this week"
  | "Small spends adding up"
  | "Weekend shape";

export type SpendingPattern = {
  id: string;
  group: PatternGroup;
  title: string;
  detail: string;
  tone: "calm" | "notice" | "warm";
  recapQuestion?: string;
};
