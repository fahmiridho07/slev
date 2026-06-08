import {
  clampActiveTabForPlanning,
  clampPatternTabForPlanning,
  clampSettingsTabForPlanning,
  hasExistingPlanningData
} from "../src/lib/planningMode";
import { initialFinanceState } from "../src/state/financeReducer";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

const emptyPlanningState = {
  monthlyPlan: initialFinanceState.monthlyPlan,
  budgetLimits: initialFinanceState.budgetLimits,
  savingsGoals: initialFinanceState.savingsGoals,
  recurringBills: initialFinanceState.recurringBills,
  balanceSnapshots: initialFinanceState.balanceSnapshots,
  transfers: initialFinanceState.transfers
};

test("hasExistingPlanningData returns false for empty planning state", () => {
  assertEqual(hasExistingPlanningData(emptyPlanningState), false, "no planning artifacts");
});

test("hasExistingPlanningData returns true when monthlyPlan is set", () => {
  assertEqual(
    hasExistingPlanningData({
      ...emptyPlanningState,
      monthlyPlan: {
        id: "plan-1",
        month: "2026-06",
        expectedIncome: 5_000_000,
        fixedCosts: 2_000_000,
        flexibleBudget: 1_500_000,
        savingsTarget: 500_000,
        createdAt: "2026-06-01T00:00:00.000Z",
        updatedAt: "2026-06-01T00:00:00.000Z"
      }
    }),
    true,
    "monthly plan triggers planning mode"
  );
});

test("hasExistingPlanningData returns true when budgetLimits are present", () => {
  assertEqual(
    hasExistingPlanningData({
      ...emptyPlanningState,
      budgetLimits: [{ category: "Meal", limitAmount: 500_000, period: "monthly" }]
    }),
    true,
    "budget limits trigger planning mode"
  );
});

test("hasExistingPlanningData returns true when savingsGoals are present", () => {
  assertEqual(
    hasExistingPlanningData({
      ...emptyPlanningState,
      savingsGoals: [
        {
          id: "goal-1",
          label: "Emergency",
          targetAmount: 10_000_000,
          savedAmount: 1_000_000,
          createdAt: "2026-06-01T00:00:00.000Z",
          updatedAt: "2026-06-01T00:00:00.000Z"
        }
      ]
    }),
    true,
    "savings goals trigger planning mode"
  );
});

test("hasExistingPlanningData returns true when recurringBills are present", () => {
  assertEqual(
    hasExistingPlanningData({
      ...emptyPlanningState,
      recurringBills: [
        {
          id: "bill-1",
          label: "Rent",
          amount: 2_000_000,
          context: "Housing",
          dayOfMonth: 1,
          active: true,
          createdAt: "2026-06-01T00:00:00.000Z",
          updatedAt: "2026-06-01T00:00:00.000Z"
        }
      ]
    }),
    true,
    "recurring bills trigger planning mode"
  );
});

test("hasExistingPlanningData returns true when balanceSnapshots are present", () => {
  assertEqual(
    hasExistingPlanningData({
      ...emptyPlanningState,
      balanceSnapshots: [
        {
          id: "snap-1",
          accountLabel: "BRI",
          amount: 1_000_000,
          snapshotDate: "2026-06-01",
          createdAt: "2026-06-01T00:00:00.000Z"
        }
      ]
    }),
    true,
    "balance snapshots trigger planning mode"
  );
});

test("clampActiveTabForPlanning falls back from budget to home when planning is off", () => {
  assertEqual(clampActiveTabForPlanning("budget", false), "home", "budget tab hidden");
  assertEqual(clampActiveTabForPlanning("money", false), "money", "other tabs stay");
});

test("clampPatternTabForPlanning falls back from accounts to breakdown when planning is off", () => {
  assertEqual(clampPatternTabForPlanning("accounts", false), "breakdown", "accounts tab hidden");
  assertEqual(clampPatternTabForPlanning("breakdown", true), "breakdown", "breakdown stays");
});

test("clampSettingsTabForPlanning falls back from bills to categories when planning is off", () => {
  assertEqual(clampSettingsTabForPlanning("bills", false), "categories", "bills tab hidden");
  assertEqual(clampSettingsTabForPlanning("appearance", true), "appearance", "appearance stays");
});

test("hasExistingPlanningData returns true when transfers are present", () => {
  assertEqual(
    hasExistingPlanningData({
      ...emptyPlanningState,
      transfers: [
        {
          id: "xfer-1",
          amount: 250_000,
          fromAccount: "BRI",
          toAccount: "Jago",
          occurredAt: "2026-06-10T08:00:00.000Z",
          createdAt: "2026-06-10T08:00:00.000Z",
          updatedAt: "2026-06-10T08:00:00.000Z"
        }
      ]
    }),
    true,
    "transfers trigger planning mode"
  );
});

for (const testCase of tests) {
  try {
    testCase.run();
    console.log(`ok - ${testCase.name}`);
  } catch (error) {
    console.error(`not ok - ${testCase.name}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  console.error("planning mode tests failed.");
} else {
  console.log(`${tests.length} planning mode tests passed.`);
}

function test(name: string, run: () => void) {
  tests.push({ name, run });
}

function assertEqual<T>(actual: T, expected: T, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${String(expected)}, got ${String(actual)}`);
  }
}