process.env.TZ = "Asia/Jakarta";

import { EntryType, SpendingContext, SpendingMoment } from "../src/features/spendingMemory.types";
import {
  buildBreakdownMonthDeltas,
  filterBreakdownMoments,
  getBreakdownDeltaBadgeKind,
  getTopBreakdownIncreases,
  shouldShowBreakdownDeltaBadge
} from "../src/lib/breakdownDrilldown";

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("filterBreakdownMoments scopes expenses to month and category", () => {
  const referenceDate = new Date(2026, 5, 15, 12, 0);
  const entries = filterBreakdownMoments(
    [
      moment({ amount: 50_000, context: "Food", occurredAt: new Date(2026, 5, 10).toISOString() }),
      moment({ amount: 75_000, context: "Food", occurredAt: new Date(2026, 4, 10).toISOString() }),
      moment({ amount: 20_000, context: "Transport", occurredAt: new Date(2026, 5, 12).toISOString() })
    ],
    "expense",
    "Food",
    referenceDate
  );

  assertEqual(entries.length, 1, "entry count");
  assertEqual(entries[0]?.amount, 50_000, "amount");
  assertEqual(entries[0]?.context, "Food", "category");
});

test("filterBreakdownMoments groups income by source", () => {
  const referenceDate = new Date(2026, 5, 15, 12, 0);
  const entries = filterBreakdownMoments(
    [
      incomeMoment({ amount: 1_000_000, occurredAt: new Date(2026, 5, 2).toISOString(), source: "Salary" }),
      incomeMoment({ amount: 250_000, occurredAt: new Date(2026, 5, 3).toISOString(), source: "Freelance" })
    ],
    "income",
    "Salary",
    referenceDate
  );

  assertEqual(entries.length, 1, "entry count");
  assertEqual(entries[0]?.source, "Salary", "source");
});

test("buildBreakdownMonthDeltas compares category totals across months", () => {
  const referenceDate = new Date(2026, 5, 15, 12, 0);
  const deltas = buildBreakdownMonthDeltas(
    [
      moment({ amount: 100_000, context: "Food", occurredAt: new Date(2026, 4, 10).toISOString() }),
      moment({ amount: 150_000, context: "Food", occurredAt: new Date(2026, 5, 10).toISOString() }),
      moment({ amount: 50_000, context: "Transport", occurredAt: new Date(2026, 5, 12).toISOString() })
    ],
    "expense",
    0,
    referenceDate
  );

  assertEqual(deltas.get("Food")?.deltaAmount, 50_000, "food delta");
  assertEqual(deltas.get("Food")?.deltaPercent, 0.5, "food percent");
  assertEqual(getBreakdownDeltaBadgeKind(deltas.get("Food")), "up", "food badge");
  assertEqual(getBreakdownDeltaBadgeKind(deltas.get("Transport")), "new", "transport badge");
});

test("getTopBreakdownIncreases ranks positive movers", () => {
  const rows = [
    { amount: 150_000, key: "Food", label: "Food", share: 0.75 },
    { amount: 50_000, key: "Transport", label: "Transport", share: 0.25 }
  ];
  const deltas = new Map([
    ["Food", { currentAmount: 150_000, previousAmount: 100_000, deltaAmount: 50_000, deltaPercent: 0.5 }],
    ["Transport", { currentAmount: 50_000, previousAmount: 80_000, deltaAmount: -30_000, deltaPercent: -0.375 }]
  ]);

  const top = getTopBreakdownIncreases(rows, deltas, 2);
  assertEqual(top.length, 1, "top length");
  assertEqual(top[0]?.key, "Food", "top key");
  assertEqual(shouldShowBreakdownDeltaBadge(deltas.get("Food")), true, "food visible");
  assertEqual(shouldShowBreakdownDeltaBadge(deltas.get("Transport")), true, "transport visible");
});

let passed = 0;

for (const { name, run } of tests) {
  try {
    run();
    passed += 1;
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    break;
  }
}

if (process.exitCode !== 1) {
  console.log(`${passed} breakdown drilldown tests passed.`);
}

function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${printable(expected)}, got ${printable(actual)}.`);
  }
}

function printable(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value);
}

function moment(input: {
  amount: number;
  context?: SpendingContext;
  id?: string;
  occurredAt: string;
  type?: EntryType;
}): SpendingMoment {
  return {
    amount: input.amount,
    context: input.context ?? "Other",
    createdAt: input.occurredAt,
    id: input.id ?? `moment-${input.occurredAt}-${input.amount}`,
    label: undefined,
    note: undefined,
    occurredAt: input.occurredAt,
    source: undefined,
    type: input.type ?? "expense",
    updatedAt: input.occurredAt
  };
}

function incomeMoment(input: {
  amount: number;
  id?: string;
  occurredAt: string;
  source?: string;
}): SpendingMoment {
  return {
    amount: input.amount,
    context: "Other",
    createdAt: input.occurredAt,
    id: input.id ?? `income-${input.occurredAt}-${input.amount}`,
    label: undefined,
    note: undefined,
    occurredAt: input.occurredAt,
    source: input.source,
    type: "income",
    updatedAt: input.occurredAt
  };
}