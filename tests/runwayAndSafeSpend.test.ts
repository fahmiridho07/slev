// Requires process.env.TZ = "Asia/Jakarta" before financeEngine/analysis date helpers load.
process.env.TZ = "Asia/Jakarta";

import { MonthlyPlan } from "../src/features/spendingMemory.types";
import { buildAllocationPlan } from "../src/lib/financeEngine";

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];
const juneMidpoint = new Date(2026, 5, 15, 12, 0);

test("buildAllocationPlan exposes daily flexible room for safe-to-spend", () => {
  const allocation = buildAllocationPlan({
    accounts: [],
    latestSnapshots: [],
    monthlyPlan: plan({
      expectedIncome: 10_000_000,
      fixedCosts: 2_000_000,
      flexibleBudget: 1_700_000,
      savingsTarget: 1_000_000
    }),
    monthlySummary: {
      expense: 300_000,
      fixedExpense: 0,
      flexibleExpense: 300_000,
      income: 0,
      net: -300_000,
      topCategories: []
    },
    today: juneMidpoint
  });

  assertEqual(allocation.dailyFlexibleRoom, 87_500, "safe-to-spend should divide remaining flexible by days left");
});

test("buildAllocationPlan reserves upcoming bills before safe-to-spend", () => {
  const allocation = buildAllocationPlan({
    accounts: [],
    latestSnapshots: [],
    monthlyPlan: plan({
      expectedIncome: 10_000_000,
      fixedCosts: 2_000_000,
      flexibleBudget: 1_700_000,
      savingsTarget: 1_000_000
    }),
    monthlySummary: {
      expense: 300_000,
      fixedExpense: 0,
      flexibleExpense: 300_000,
      income: 0,
      net: -300_000,
      topCategories: []
    },
    upcomingBillsReserve: 400_000,
    today: juneMidpoint
  });

  assertEqual(allocation.dailyFlexibleRoom, 62_500, "safe-to-spend should reserve upcoming bills first");
});

test("buildAllocationPlan keeps daily flexible room at zero without a plan", () => {
  const allocation = buildAllocationPlan({
    accounts: [],
    latestSnapshots: [],
    monthlyPlan: null,
    monthlySummary: {
      expense: 0,
      fixedExpense: 0,
      flexibleExpense: 0,
      income: 0,
      net: 0,
      topCategories: []
    },
    today: juneMidpoint
  });

  assertEqual(allocation.dailyFlexibleRoom, 0, "safe-to-spend should stay hidden without a monthly plan");
});

for (const { name, run } of tests) {
  try {
    run();
    console.log(`ok - ${name}`);
  } catch (error) {
    process.exitCode = 1;
    const message = error instanceof Error ? error.message : String(error);
    console.error(`not ok - ${name}`);
    console.error(`  ${message}`);
  }
}

if (process.exitCode) {
  console.error("runway and safe-spend tests failed.");
} else {
  console.log(`${tests.length} runway and safe-spend tests passed.`);
}

function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${printable(expected)}, got ${printable(actual)}.`);
  }
}

function plan(input: {
  expectedIncome: number;
  fixedCosts: number;
  flexibleBudget: number;
  savingsTarget: number;
}): MonthlyPlan {
  return {
    createdAt: "2026-06-01T00:00:00.000Z",
    expectedIncome: input.expectedIncome,
    fixedCosts: input.fixedCosts,
    flexibleBudget: input.flexibleBudget,
    id: "plan-june",
    month: "2026-06",
    savingsTarget: input.savingsTarget,
    updatedAt: "2026-06-01T00:00:00.000Z"
  };
}

function printable(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value);
}