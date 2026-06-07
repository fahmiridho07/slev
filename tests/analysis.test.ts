import {
  buildAccountActivity,
  buildCashflowWeeks,
  buildRepeatHints,
  buildSpendingTrend,
  dateKey,
  filterMoments,
  getAllocationActionCopy,
  getFrequentAccountLabels,
  getMomentsInPeriod,
  getMonthKey,
  getRepeatHint,
  getRepeatSuggestions,
  groupMomentsByRecallRange,
  isWithinRange,
  sumExpenseMoments,
  sumMoments
} from "../src/lib/analysis";
import { AllocationPlan } from "../src/lib/financeEngine";
import { EntryType, MoneyAccount, SpendingContext, SpendingMoment } from "../src/features/spendingMemory.types";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];
const juneMidpoint = new Date("2026-06-15T08:00:00.000Z");

test("dateKey and getMonthKey format stable keys", () => {
  assertEqual(dateKey(new Date("2026-06-05T12:00:00.000Z")), "2026-06-05", "dateKey");
  assertEqual(getMonthKey(new Date("2026-06-05T12:00:00.000Z")), "2026-06", "getMonthKey");
});

test("isWithinRange checks half-open date intervals", () => {
  const start = new Date("2026-06-01T00:00:00.000Z");
  const end = new Date("2026-07-01T00:00:00.000Z");
  assertEqual(isWithinRange("2026-06-15T08:00:00.000Z", start, end), true, "inside range");
  assertEqual(isWithinRange("2026-07-01T00:00:00.000Z", start, end), false, "end exclusive");
});

test("filterMoments passes through empty query and matches labels", () => {
  const moments = [
    moment({ amount: 10000, label: "Coffee run", occurredAt: "2026-06-01T01:00:00.000Z" }),
    moment({ amount: 20000, label: "Lunch", occurredAt: "2026-06-02T01:00:00.000Z" })
  ];

  assertEqual(filterMoments(moments, "").length, 2, "empty query");
  assertEqual(filterMoments(moments, "coffee").length, 1, "label search");
  assertEqual(filterMoments(moments, "10000").length, 1, "amount search");
});

test("getFrequentAccountLabels falls back to account order without moments", () => {
  const accounts = [
    moneyAccount({ label: "Jago", index: 0 }),
    moneyAccount({ label: "BRI", index: 1 }),
    moneyAccount({ label: "Cash", index: 2 })
  ];

  assertArrayEqual(
    getFrequentAccountLabels([], accounts),
    ["Jago", "BRI", "Cash"],
    "account order fallback"
  );
});

test("getFrequentAccountLabels ranks labels by usage count", () => {
  const accounts = [
    moneyAccount({ label: "Jago", index: 0 }),
    moneyAccount({ label: "BRI", index: 1 }),
    moneyAccount({ label: "Cash", index: 2 })
  ];
  const moments = [
    moment({ amount: 10000, accountLabel: "BRI", occurredAt: "2026-06-01T01:00:00.000Z" }),
    moment({ amount: 12000, accountLabel: "Jago", occurredAt: "2026-06-02T01:00:00.000Z" }),
    moment({ amount: 8000, accountLabel: "BRI", occurredAt: "2026-06-03T01:00:00.000Z" }),
    moment({ amount: 9000, accountLabel: "BRI", occurredAt: "2026-06-04T01:00:00.000Z" })
  ];

  assertArrayEqual(
    getFrequentAccountLabels(moments, accounts),
    ["BRI", "Jago", "Cash"],
    "frequency ordering with backfill"
  );
});

test("getFrequentAccountLabels tie-breaks by most recent usage", () => {
  const accounts = [
    moneyAccount({ label: "Jago", index: 0 }),
    moneyAccount({ label: "BRI", index: 1 })
  ];
  const moments = [
    moment({ amount: 10000, accountLabel: "Jago", occurredAt: "2026-06-01T01:00:00.000Z" }),
    moment({ amount: 12000, accountLabel: "BRI", occurredAt: "2026-06-02T01:00:00.000Z" }),
    moment({ amount: 8000, accountLabel: "Jago", occurredAt: "2026-06-05T01:00:00.000Z" })
  ];

  assertArrayEqual(
    getFrequentAccountLabels(moments, accounts),
    ["Jago", "BRI"],
    "recency tie-break"
  );
});

test("getFrequentAccountLabels ignores labels missing from accounts", () => {
  const accounts = [moneyAccount({ label: "Jago", index: 0 })];
  const moments = [
    moment({ amount: 10000, accountLabel: "Old wallet", occurredAt: "2026-06-01T01:00:00.000Z" }),
    moment({ amount: 12000, accountLabel: "Jago", occurredAt: "2026-06-02T01:00:00.000Z" })
  ];

  assertArrayEqual(getFrequentAccountLabels(moments, accounts), ["Jago"], "unknown labels ignored");
});

test("getFrequentAccountLabels respects limit", () => {
  const accounts = [
    moneyAccount({ label: "Jago", index: 0 }),
    moneyAccount({ label: "BRI", index: 1 }),
    moneyAccount({ label: "Cash", index: 2 })
  ];

  assertArrayEqual(
    getFrequentAccountLabels([], accounts, 2),
    ["Jago", "BRI"],
    "limit respected"
  );
});

test("getRepeatSuggestions dedupes labels and skips income", () => {
  const suggestions = getRepeatSuggestions([
    moment({ amount: 10000, context: "Coffee", label: "Latte", occurredAt: "2026-06-01T01:00:00.000Z" }),
    moment({ amount: 12000, context: "Coffee", label: "Latte", occurredAt: "2026-06-02T01:00:00.000Z" }),
    moment({ amount: 500000, type: "income", source: "Salary", occurredAt: "2026-06-03T01:00:00.000Z" }),
    moment({ amount: 8000, context: "Meal", label: "Nasi", occurredAt: "2026-06-04T01:00:00.000Z" })
  ]);

  assertEqual(suggestions.length, 2, "deduped count");
  assertEqual(suggestions[0]?.label, "Latte", "first suggestion");
});

test("getRepeatHint appears after three same-context expenses in seven days", () => {
  const now = Date.now();
  const recent = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
  const moments = [
    moment({ amount: 10000, context: "Coffee", occurredAt: recent }),
    moment({ amount: 12000, context: "Coffee", occurredAt: recent }),
    moment({ amount: 8000, context: "Coffee", occurredAt: recent })
  ];
  const target = moments[0]!;

  assertEqual(getRepeatHint(target, moments), "3 this week", "repeat hint");
  assertEqual(getRepeatHint({ ...target, type: "income", source: "Salary" }, moments), undefined, "income skipped");
});

test("buildRepeatHints matches getRepeatHint for every moment in one pass", () => {
  const now = Date.now();
  const recent = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();
  const old = new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString();
  const moments = [
    moment({ amount: 10000, context: "Coffee", occurredAt: recent }),
    moment({ amount: 12000, context: "Coffee", occurredAt: recent }),
    moment({ amount: 8000, context: "Coffee", occurredAt: recent }),
    moment({ amount: 500000, type: "income", source: "Salary", occurredAt: recent }),
    moment({ amount: 15000, context: "Food", occurredAt: old })
  ];
  const hints = buildRepeatHints(moments);

  moments.forEach((item) => {
    assertEqual(hints.get(item.id), getRepeatHint(item, moments), `hint for ${item.id}`);
  });
  assertEqual(hints.get(moments[3]!.id), undefined, "income omitted from map");
  assertEqual(hints.get(moments[4]!.id), undefined, "stale context omitted from map");
});

test("sumMoments and sumExpenseMoments total amounts by type", () => {
  const moments = [
    moment({ amount: 10000, occurredAt: "2026-06-01T01:00:00.000Z" }),
    moment({ amount: 20000, occurredAt: "2026-06-02T01:00:00.000Z" }),
    moment({ amount: 500000, type: "income", source: "Salary", occurredAt: "2026-06-03T01:00:00.000Z" })
  ];

  assertEqual(sumMoments(moments), 530000, "all moments");
  assertEqual(sumExpenseMoments(moments), 30000, "expense only");
});

test("getMomentsInPeriod filters weekly and monthly windows", () => {
  const moments = [
    moment({ amount: 10000, occurredAt: "2026-06-16T01:00:00.000Z" }),
    moment({ amount: 20000, occurredAt: "2026-05-20T01:00:00.000Z" })
  ];

  const monthly = getMomentsInPeriod(moments, "monthly", juneMidpoint);
  assertEqual(monthly.length, 1, "June monthly window");

  const weekly = getMomentsInPeriod(moments, "weekly", juneMidpoint);
  assertEqual(weekly.length, 1, "week containing June 16");
});

test("groupMomentsByRecallRange buckets today, yesterday, and earlier", () => {
  const now = new Date();
  const today = now.toISOString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const eightDaysAgo = new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString();

  const groups = groupMomentsByRecallRange([
    moment({ amount: 10000, occurredAt: today }),
    moment({ amount: 12000, occurredAt: yesterday.toISOString() }),
    moment({ amount: 8000, occurredAt: eightDaysAgo })
  ]);

  assertEqual(groups.length, 3, "non-empty groups");
  assertEqual(groups[0]?.key, "today", "today bucket");
  assertEqual(groups[1]?.key, "yesterday", "yesterday bucket");
  assertEqual(groups[2]?.key, "earlier", "older than a week");
});

test("buildAccountActivity groups current-month spending by account", () => {
  const currentMonth = new Date();
  const occurredAt = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 10, 8).toISOString();
  const rows = buildAccountActivity([
    moment({ amount: 50000, accountLabel: "Jago", occurredAt }),
    moment({ amount: 20000, accountLabel: "BRI", occurredAt }),
    moment({ amount: 100000, type: "income", source: "Salary", accountLabel: "BRI", occurredAt })
  ]);

  assertEqual(rows.length, 2, "two accounts");
  assertEqual(rows[0]?.label, "Jago", "highest expense first");
  assertEqual(rows[0]?.expense, 50000, "Jago expense");
  assertEqual(rows[1]?.net, 80000, "BRI net income minus expense");
});

test("buildCashflowWeeks returns eight weekly buckets with net totals", () => {
  const weeks = buildCashflowWeeks([
    moment({ amount: 30000, occurredAt: new Date().toISOString() }),
    moment({ amount: 100000, type: "income", source: "Salary", occurredAt: new Date().toISOString() })
  ]);

  assertEqual(weeks.length, 8, "eight weeks");
  const currentWeek = weeks[weeks.length - 1];
  assertEqual(currentWeek?.income, 100000, "current week income");
  assertEqual(currentWeek?.expense, 30000, "current week expense");
  assertEqual(currentWeek?.net, 70000, "current week net");
});

test("buildSpendingTrend returns three months and top categories", () => {
  const trend = buildSpendingTrend([
    moment({ amount: 600000, context: "Meal", occurredAt: "2026-06-04T01:00:00.000Z" }),
    moment({ amount: 400000, context: "Transport", occurredAt: "2026-06-05T01:00:00.000Z" }),
    moment({ amount: 500000, context: "Meal", occurredAt: "2026-05-20T01:00:00.000Z" })
  ]);

  assertEqual(trend.months.length, 3, "three months");
  assertEqual(trend.months[2]?.amount, 1000000, "current month expense total");
  assertEqual(trend.topCategories[0]?.label, "Meal", "top category");
});

test("getAllocationActionCopy returns steady hold messaging", () => {
  const copy = getAllocationActionCopy(holdAllocationPlan());

  assertEqual(copy.title, "Allocation is steady", "hold title");
  assertEqual(copy.tone, "calm", "hold tone");
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
    console.error(`${failures} analysis test${failures === 1 ? "" : "s"} failed.`);
    return;
  }

  console.log(`${tests.length} analysis tests passed.`);
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${printable(expected)}, got ${printable(actual)}.`);
  }
}

function assertArrayEqual(actual: unknown[], expected: unknown[], message: string): void {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected), message);
}

function moneyAccount(input: { index?: number; label: string }): MoneyAccount {
  const index = input.index ?? 0;
  return {
    createdAt: "2026-01-01T00:00:00.000Z",
    id: `account-${index}`,
    isIncomeHub: index === 0,
    kind: "bank",
    label: input.label,
    updatedAt: "2026-01-01T00:00:00.000Z"
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

function holdAllocationPlan(): AllocationPlan {
  return {
    dailyFlexibleRoom: 0,
    expectedIncome: 0,
    fixedRemaining: 0,
    flexibleRemaining: 0,
    hubBalance: 0,
    incomeGap: 0,
    incomeReceived: 0,
    nextAction: { kind: "hold" },
    plannedGap: 0,
    plannedTotal: 0,
    pocketBalance: 0,
    pocketCoverageDays: 0,
    pocketTopUpNeed: 0,
    possibleSavings: 0,
    rows: [],
    savingsGap: 0
  };
}

function printable(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value);
}