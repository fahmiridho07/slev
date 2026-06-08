import {
  BalanceSnapshot,
  CategoryMode,
  EntryType,
  MoneyAccount,
  MonthlyPlan,
  SpendingContext,
  SpendingMoment
} from "../features/spendingMemory.types";
import { DEFAULT_SPENDING_CONTEXTS } from "../data/spendingMemory";
import { displayContext } from "../i18n/display";
import { getRuntimeStrings } from "../i18n/runtime";
import { getMonthRange, isWithinRange, sumMoments } from "./dateRanges";

export type FinanceCategoryModeValue = CategoryMode["mode"];

export type FinanceMonthSummary = {
  expense: number;
  fixedExpense: number;
  flexibleExpense: number;
  income: number;
  net: number;
  topCategories: {
    amount: number;
    label: string;
  }[];
};

export type FinanceBreakdownRow = {
  amount: number;
  key: string;
  label: string;
  share: number;
};

export type AllocationActionKind =
  | "set_plan"
  | "snapshot_balances"
  | "plan_exceeds_income"
  | "flexible_over_plan"
  | "top_up_pockets"
  | "hold";

export type AllocationRow = {
  actual: number;
  key: "income" | "fixed" | "flexible" | "savings";
  planned: number;
  progress: number;
  remaining: number;
};

export type AllocationPlan = {
  dailyFlexibleRoom: number;
  expectedIncome: number;
  fixedRemaining: number;
  flexibleRemaining: number;
  hubBalance: number;
  incomeGap: number;
  incomeReceived: number;
  nextAction: {
    amount?: number;
    kind: AllocationActionKind;
  };
  plannedGap: number;
  plannedTotal: number;
  pocketBalance: number;
  pocketCoverageDays: number;
  pocketTopUpNeed: number;
  possibleSavings: number;
  rows: AllocationRow[];
  savingsGap: number;
};

export function buildCurrentMonthSummary(
  moments: SpendingMoment[],
  categoryModes: CategoryMode[],
  referenceDate = new Date()
): FinanceMonthSummary {
  const range = getMonthRange(referenceDate, 0);
  const monthMoments = moments.filter((moment) => isWithinRange(moment.occurredAt, range.start, range.end));
  const modeByCategory = getModeByCategory(categoryModes);
  const income = sumMoments(monthMoments.filter((moment) => moment.type === "income"));
  const expenses = monthMoments.filter((moment) => moment.type === "expense");
  const fixedExpense = sumMoments(expenses.filter((moment) => modeByCategory.get(moment.context) === "fixed"));
  const flexibleExpense = sumMoments(expenses.filter((moment) => modeByCategory.get(moment.context) !== "fixed"));
  const breakdown = buildMonthlyBreakdown(monthMoments, "expense", referenceDate);

  return {
    expense: fixedExpense + flexibleExpense,
    fixedExpense,
    flexibleExpense,
    income,
    net: income - fixedExpense - flexibleExpense,
    topCategories: breakdown.slice(0, 2).map((row) => ({ amount: row.amount, label: row.label }))
  };
}

export function buildMonthlyBreakdown(
  moments: SpendingMoment[],
  type: EntryType,
  referenceDate = new Date()
): FinanceBreakdownRow[] {
  const currentMonth = getMonthRange(referenceDate, 0);
  const filtered = moments.filter(
    (moment) => moment.type === type && isWithinRange(moment.occurredAt, currentMonth.start, currentMonth.end)
  );
  const total = sumMoments(filtered);
  const grouped = filtered.reduce<Record<string, number>>((acc, moment) => {
    const label =
      type === "income"
        ? moment.source || getRuntimeStrings().memory.momentTitle.income
        : moment.context;
    acc[label] = (acc[label] ?? 0) + moment.amount;
    return acc;
  }, {});

  return Object.entries(grouped)
    .map(([label, amount]) => ({
      amount,
      key: label,
      label: type === "expense" ? displayContext(label) : label,
      share: total > 0 ? amount / total : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getModeByCategory(categoryModes: CategoryMode[]): Map<SpendingContext, FinanceCategoryModeValue> {
  const modes = new Map<SpendingContext, FinanceCategoryModeValue>(
    DEFAULT_SPENDING_CONTEXTS.map((category) => [category, category === "Bills" || category === "Home" ? "fixed" : "flexible"])
  );
  categoryModes.forEach((item) => {
    modes.set(item.category, item.mode);
  });
  return modes;
}

export function buildAllocationPlan({
  accounts,
  latestSnapshots,
  hasBalanceEvidence,
  monthlyPlan,
  monthlySummary,
  upcomingBillsReserve = 0,
  today = new Date()
}: {
  hasBalanceEvidence?: boolean;
  accounts: MoneyAccount[];
  latestSnapshots: BalanceSnapshot[];
  monthlyPlan: MonthlyPlan | null;
  monthlySummary: FinanceMonthSummary;
  upcomingBillsReserve?: number;
  today?: Date;
}): AllocationPlan {
  const expectedIncome = monthlyPlan?.expectedIncome ?? 0;
  const fixedBudget = monthlyPlan?.fixedCosts ?? 0;
  const flexibleBudget = monthlyPlan?.flexibleBudget ?? 0;
  const savingsTarget = monthlyPlan?.savingsTarget ?? 0;
  const plannedTotal = fixedBudget + flexibleBudget + savingsTarget;
  const plannedGap = expectedIncome - plannedTotal;
  const incomeGap = Math.max(0, expectedIncome - monthlySummary.income);
  const fixedRemaining = fixedBudget - monthlySummary.fixedExpense;
  const flexibleRemaining = flexibleBudget - monthlySummary.flexibleExpense;
  const possibleSavings = Math.max(0, monthlySummary.net);
  const savingsGap = savingsTarget - possibleSavings;
  const daysRemaining = getDaysRemainingInMonth(today);
  const hasBalances = hasBalanceEvidence ?? latestSnapshots.length > 0;
  const flexibleAfterBills = Math.max(0, flexibleRemaining - Math.max(0, upcomingBillsReserve));
  const dailyFlexibleRoom = monthlyPlan
    ? Math.max(0, Math.round(flexibleAfterBills / daysRemaining))
    : 0;
  const snapshotByLabel = new Map(latestSnapshots.map((snapshot) => [snapshot.accountLabel, snapshot.amount]));
  const incomeHubLabel = accounts.find((account) => account.isIncomeHub)?.label;
  const hubBalance = incomeHubLabel ? snapshotByLabel.get(incomeHubLabel) ?? 0 : 0;
  const pocketBalance = latestSnapshots
    .filter((snapshot) => snapshot.accountLabel !== incomeHubLabel)
    .reduce((sum, snapshot) => sum + snapshot.amount, 0);
  const pocketTopUpNeed = monthlyPlan && hasBalances
    ? Math.max(0, flexibleRemaining - pocketBalance)
    : 0;
  const pocketCoverageDays = dailyFlexibleRoom > 0
    ? Math.floor(pocketBalance / dailyFlexibleRoom)
    : 0;

  return {
    dailyFlexibleRoom,
    expectedIncome,
    fixedRemaining,
    flexibleRemaining,
    hubBalance,
    incomeGap,
    incomeReceived: monthlySummary.income,
    nextAction: getAllocationAction({
      flexibleRemaining,
      hasPlan: Boolean(monthlyPlan),
      hasSnapshots: hasBalances,
      plannedGap,
      pocketTopUpNeed
    }),
    plannedGap,
    plannedTotal,
    pocketBalance,
    pocketCoverageDays,
    pocketTopUpNeed,
    possibleSavings,
    rows: [
      buildAllocationRow("income", expectedIncome, monthlySummary.income),
      buildAllocationRow("fixed", fixedBudget, monthlySummary.fixedExpense),
      buildAllocationRow("flexible", flexibleBudget, monthlySummary.flexibleExpense),
      buildAllocationRow("savings", savingsTarget, possibleSavings)
    ],
    savingsGap
  };
}

function buildAllocationRow(
  key: AllocationRow["key"],
  planned: number,
  actual: number
): AllocationRow {
  return {
    actual,
    key,
    planned,
    progress: planned > 0 ? actual / planned : 0,
    remaining: planned - actual
  };
}

function getAllocationAction({
  flexibleRemaining,
  hasPlan,
  hasSnapshots,
  plannedGap,
  pocketTopUpNeed
}: {
  flexibleRemaining: number;
  hasPlan: boolean;
  hasSnapshots: boolean;
  plannedGap: number;
  pocketTopUpNeed: number;
}): AllocationPlan["nextAction"] {
  if (!hasPlan) return { kind: "set_plan" };
  if (!hasSnapshots) return { kind: "snapshot_balances" };
  if (plannedGap < 0) return { amount: Math.abs(plannedGap), kind: "plan_exceeds_income" };
  if (flexibleRemaining < 0) return { amount: Math.abs(flexibleRemaining), kind: "flexible_over_plan" };
  if (pocketTopUpNeed > 0) return { amount: pocketTopUpNeed, kind: "top_up_pockets" };
  return { kind: "hold" };
}

export function getDaysRemainingInMonth(date: Date): number {
  const dayOfMonth = date.getDate();
  const daysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  return Math.max(1, daysInMonth - dayOfMonth + 1);
}