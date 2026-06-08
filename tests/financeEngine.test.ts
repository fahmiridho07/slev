import {
  buildAllocationPlan,
  buildCurrentMonthSummary,
  buildMonthlyBreakdown,
  getDaysRemainingInMonth,
  getModeByCategory
} from "../src/lib/financeEngine";
import {
  buildSafeToSpend,
  getEffectiveBalance,
  simulatePurchase
} from "../src/lib/safeToSpend";
import {
  EntryType,
  MoneyAccount,
  MonthlyPlan,
  SpendingContext,
  SpendingMoment
} from "../src/features/spendingMemory.types";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];
const juneMidpoint = new Date("2026-06-15T08:00:00.000Z");

test("summarizes current month with default and custom category modes", () => {
  const summary = buildCurrentMonthSummary(
    [
      moment({ amount: 10_000_000, occurredAt: "2026-06-02T01:00:00.000Z", source: "Salary", type: "income" }),
      moment({ amount: 1_500_000, context: "Bills", label: "Rent", occurredAt: "2026-06-03T01:00:00.000Z" }),
      moment({ amount: 300_000, context: "Meal", occurredAt: "2026-06-04T01:00:00.000Z" }),
      moment({ amount: 200_000, context: "Transport", occurredAt: "2026-06-05T01:00:00.000Z" }),
      moment({ amount: 999_000, context: "Meal", occurredAt: "2026-05-20T01:00:00.000Z" })
    ],
    [{ category: "Transport", mode: "fixed" }],
    juneMidpoint
  );

  assertEqual(summary.income, 10_000_000, "income should include only June income");
  assertEqual(summary.fixedExpense, 1_700_000, "fixed expense should include Bills and custom-fixed Transport");
  assertEqual(summary.flexibleExpense, 300_000, "flexible expense should include Meal");
  assertEqual(summary.expense, 2_000_000, "expense should total fixed and flexible spending");
  assertEqual(summary.net, 8_000_000, "net should subtract spending from income");
  assertEqual(summary.topCategories[0]?.label, "Bills", "top category should be Bills");
});

test("breakdown groups current-month expenses and calculates shares", () => {
  const rows = buildMonthlyBreakdown(
    [
      moment({ amount: 600_000, context: "Meal", occurredAt: "2026-06-01T01:00:00.000Z" }),
      moment({ amount: 400_000, context: "Transport", occurredAt: "2026-06-02T01:00:00.000Z" }),
      moment({ amount: 500_000, context: "Meal", occurredAt: "2026-05-01T01:00:00.000Z" })
    ],
    "expense",
    juneMidpoint
  );

  assertEqual(rows.length, 2, "breakdown should include two June categories");
  assertEqual(rows[0]?.label, "Meal", "largest row should be first");
  assertEqual(rows[0]?.amount, 600_000, "Meal amount should be grouped");
  assertEqual(rows[0]?.share, 0.6, "Meal share should be 60%");
});

test("allocation identifies pocket top-up need from income hub", () => {
  const allocation = buildAllocationPlan({
    accounts: [
      account("BRI", "bank", true),
      account("Jago", "bank", false)
    ],
    hasBalanceEvidence: true,
    latestSnapshots: [
      snapshot("BRI", 3_000_000, "2026-06-15T01:00:00.000Z"),
      snapshot("Jago", 700_000, "2026-06-15T01:00:00.000Z")
    ],
    monthlyPlan: plan({
      expectedIncome: 10_000_000,
      fixedCosts: 2_000_000,
      flexibleBudget: 2_000_000,
      savingsTarget: 3_000_000
    }),
    monthlySummary: {
      expense: 2_000_000,
      fixedExpense: 1_700_000,
      flexibleExpense: 300_000,
      income: 10_000_000,
      net: 8_000_000,
      topCategories: []
    },
    today: juneMidpoint
  });

  assertEqual(allocation.flexibleRemaining, 1_700_000, "flexible remaining should subtract flexible spending");
  assertEqual(allocation.dailyFlexibleRoom, 106_250, "daily room should divide remaining flexible by days left in June");
  assertEqual(allocation.pocketTopUpNeed, 1_000_000, "pocket top-up should compare pocket balance to remaining flexible budget");
  assertEqual(allocation.nextAction.kind, "top_up_pockets", "next action should recommend funding pockets");
});

test("allocation asks for a plan before giving budget guidance", () => {
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

  assertEqual(allocation.nextAction.kind, "set_plan", "missing plan should be the first action");
  assertEqual(allocation.dailyFlexibleRoom, 0, "daily room should stay zero without a plan");
});

test("category modes preserve fixed defaults and custom overrides", () => {
  const modes = getModeByCategory([{ category: "Meal", mode: "fixed" }]);

  assertEqual(modes.get("Bills"), "fixed", "Bills should default to fixed");
  assertEqual(modes.get("Home"), "fixed", "Home should default to fixed");
  assertEqual(modes.get("Coffee"), "flexible", "Coffee should default to flexible");
  assertEqual(modes.get("Meal"), "fixed", "custom mode should override defaults");
});

test("getEffectiveBalance returns null without balance anchor", () => {
  const balance = getEffectiveBalance({
    balanceAnchor: null,
    moments: [],
    referenceDate: juneMidpoint
  });

  assertEqual(balance, null, "missing anchor should surface a set-balance state");
});

test("getEffectiveBalance totals anchor plus net moments since setAt", () => {
  const balance = getEffectiveBalance({
    balanceAnchor: balanceAnchor(1_000_000, "2026-06-10T12:00:00.000Z"),
    moments: [
      moment({ amount: 50_000, occurredAt: "2026-06-09T12:00:00.000Z" }),
      moment({ amount: 100_000, accountLabel: "GoPay", occurredAt: "2026-06-12T12:00:00.000Z" }),
      moment({ amount: 200_000, occurredAt: "2026-06-13T12:00:00.000Z", source: "Bonus", type: "income" })
    ],
    referenceDate: juneMidpoint
  });

  assertEqual(balance, 1_100_000, "effective balance should add income and subtract expenses after setAt");
});

test("buildSafeToSpend computes safeDaily from effective balance and days left", () => {
  const daysLeft = getDaysRemainingInMonth(juneMidpoint);
  const safe = buildSafeToSpend({
    balanceAnchor: balanceAnchor(1_600_000, "2026-06-15T01:00:00.000Z"),
    moments: [],
    referenceDate: juneMidpoint
  });

  assertEqual(safe.effectiveBalance, 1_600_000, "effective balance should use the total anchor");
  assertEqual(safe.daysLeft, daysLeft, "days left should default to month remainder");
  assertEqual(safe.safeDaily, Math.round(1_600_000 / daysLeft), "safeDaily should divide balance by days left");
});

test("buildSafeToSpend classifies spending pace against safeDaily", () => {
  const daysLeft = getDaysRemainingInMonth(juneMidpoint);
  const baseArgs = {
    balanceAnchor: balanceAnchor(1_000_000, "2026-06-15T08:00:00.000Z"),
    referenceDate: juneMidpoint,
    windowDays: 10
  };
  const safeDaily = Math.round(1_000_000 / daysLeft);

  const underSpend = buildSafeToSpend({
    ...baseArgs,
    moments: trailingExpenseMoments(safeDaily - 20_000, 10, juneMidpoint)
  });
  const overSpend = buildSafeToSpend({
    ...baseArgs,
    moments: trailingExpenseMoments(safeDaily + 20_000, 10, juneMidpoint)
  });
  const evenSpend = buildSafeToSpend({
    ...baseArgs,
    moments: trailingExpenseMoments(safeDaily, 10, juneMidpoint)
  });
  const unknownSpend = buildSafeToSpend({
    balanceAnchor: null,
    moments: [],
    referenceDate: juneMidpoint
  });

  assertEqual(underSpend.pace, "under", "lower typical spend should pace under safeDaily");
  assertEqual(overSpend.pace, "over", "higher typical spend should pace over safeDaily");
  assertEqual(evenSpend.pace, "even", "matching typical spend should pace even");
  assertEqual(unknownSpend.pace, "unknown", "missing balance should hide pace");
  assertEqual(unknownSpend.safeDaily, null, "safeDaily should be null without balance evidence");
});

test("simulatePurchase rejects purchases that break daily coverage even when balance remains", () => {
  const safe = buildSafeToSpend({
    balanceAnchor: balanceAnchor(1_000_000, "2026-06-15T01:00:00.000Z"),
    moments: trailingExpenseMoments(50_000, 10, juneMidpoint),
    referenceDate: juneMidpoint,
    windowDays: 10
  });
  const typicalNeed = safe.typicalDaily * safe.daysLeft;

  const tightPurchase = simulatePurchase({ amount: 300_000, safe });
  const comfortablePurchase = simulatePurchase({ amount: 100_000, safe });

  assertEqual(tightPurchase.remainingBalance, 700_000, "purchase should reduce remaining balance");
  assertEqual(tightPurchase.remainingBalance >= 0, true, "purchase should still leave non-negative balance");
  assertEqual(tightPurchase.remainingBalance < typicalNeed, true, "remaining cash should fall short of typical daily needs");
  assertEqual(tightPurchase.coversTypicalDays, false, "remaining cash should not cover typical daily needs");
  assertEqual(tightPurchase.affordable, false, "affordable requires balance and daily coverage");
  assertEqual(comfortablePurchase.affordable, true, "smaller purchase should stay affordable");
  assertEqual(
    comfortablePurchase.newSafeDaily,
    Math.max(0, Math.round(900_000 / safe.daysLeft)),
    "newSafeDaily should recompute from remaining balance"
  );
});

runTests();

function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

function runTests(): void {
  let failures = 0;

  tests.forEach((item) => {
    try {
      item.run();
      console.log(`ok - ${item.name}`);
    } catch (error) {
      failures += 1;
      console.error(`not ok - ${item.name}`);
      console.error(error instanceof Error ? error.message : String(error));
    }
  });

  if (failures > 0) {
    process.exitCode = 1;
    console.error(`${failures} finance engine test${failures === 1 ? "" : "s"} failed.`);
    return;
  }

  console.log(`${tests.length} finance engine tests passed.`);
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${printable(expected)}, got ${printable(actual)}.`);
  }
}

function account(
  label: string,
  kind: MoneyAccount["kind"],
  isIncomeHub: boolean
): MoneyAccount {
  return {
    createdAt: "2026-06-01T00:00:00.000Z",
    id: `account-${label}`,
    isIncomeHub,
    kind,
    label,
    updatedAt: "2026-06-01T00:00:00.000Z"
  };
}

function moment(input: {
  accountLabel?: string;
  amount: number;
  context?: SpendingContext;
  label?: string;
  occurredAt: string;
  source?: string;
  type?: EntryType;
}): SpendingMoment {
  return {
    accountLabel: input.accountLabel,
    amount: input.amount,
    context: input.context ?? "Other",
    createdAt: input.occurredAt,
    id: `moment-${input.occurredAt}-${input.amount}-${input.context ?? "Other"}`,
    label: input.label,
    note: undefined,
    occurredAt: input.occurredAt,
    source: input.source,
    type: input.type ?? "expense",
    updatedAt: input.occurredAt
  };
}

function snapshot(
  accountLabel: string,
  amount: number,
  snapshotDate: string
) {
  return {
    accountLabel,
    amount,
    createdAt: snapshotDate,
    id: `snapshot-${accountLabel}-${snapshotDate}-${amount}`,
    snapshotDate
  };
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

function balanceAnchor(amount: number, setAt: string) {
  return { amount, setAt };
}

function trailingExpenseMoments(dailyAmount: number, dayCount: number, referenceDate: Date): SpendingMoment[] {
  const moments: SpendingMoment[] = [];
  const windowEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  for (let offset = 1; offset <= dayCount; offset += 1) {
    const day = new Date(windowEnd);
    day.setDate(day.getDate() - offset);
    moments.push(
      moment({
        amount: dailyAmount,
        context: "Meal",
        occurredAt: day.toISOString()
      })
    );
  }

  return moments;
}