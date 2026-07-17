process.env.TZ = "Asia/Jakarta";

import { EntryType, MoneyTransfer, SpendingContext, SpendingMoment } from "../src/features/spendingMemory.types";
import {
  buildMonthExpenseComparison,
  getEarliestSpendingMonthOffset,
  getMonthReferenceDate,
  isCurrentMonthDate,
  isCurrentMonthOffset
} from "../src/lib/spendingPeriod";

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("getMonthReferenceDate shifts by month offset", () => {
  const referenceDate = new Date(2026, 5, 15, 12, 0);
  const month = getMonthReferenceDate(-1, referenceDate);
  assertEqual(month.getFullYear(), 2026, "year");
  assertEqual(month.getMonth(), 4, "month");
  assertEqual(month.getDate(), 1, "day");
});

test("getEarliestSpendingMonthOffset reaches first logged month", () => {
  const referenceDate = new Date(2026, 5, 15, 12, 0);
  const offset = getEarliestSpendingMonthOffset(
    [
      moment({ amount: 10_000, occurredAt: new Date(2026, 2, 10).toISOString() }),
      moment({ amount: 20_000, occurredAt: new Date(2026, 5, 5).toISOString() })
    ],
    [],
    referenceDate
  );
  assertEqual(offset, -3, "earliest offset");
});

test("getEarliestSpendingMonthOffset includes transfers in earliest month", () => {
  const referenceDate = new Date(2026, 5, 15, 12, 0);
  const offset = getEarliestSpendingMonthOffset(
    [],
    [
      moneyTransfer({
        amount: 100_000,
        fromAccount: "BRI",
        occurredAt: new Date(2026, 1, 8).toISOString(),
        toAccount: "Jago"
      })
    ],
    referenceDate
  );
  assertEqual(offset, -4, "transfer earliest offset");
});

test("buildMonthExpenseComparison compares adjacent months", () => {
  const referenceDate = new Date(2026, 5, 15, 12, 0);
  const comparison = buildMonthExpenseComparison(
    [
      moment({ amount: 100_000, occurredAt: new Date(2026, 4, 10).toISOString() }),
      moment({ amount: 150_000, occurredAt: new Date(2026, 5, 10).toISOString() })
    ],
    0,
    referenceDate
  );

  assertEqual(comparison.previousExpense, 100_000, "previous expense");
  assertEqual(comparison.currentExpense, 150_000, "current expense");
  assertEqual(comparison.deltaAmount, 50_000, "delta amount");
  assertEqual(comparison.deltaPercent, 0.5, "delta percent");
});

test("month offset helpers identify current month", () => {
  const referenceDate = new Date(2026, 5, 1);
  assertEqual(isCurrentMonthOffset(0), true, "offset zero");
  assertEqual(isCurrentMonthOffset(-1), false, "offset negative");
  assertEqual(isCurrentMonthDate(referenceDate, referenceDate), true, "current month date");
  assertEqual(isCurrentMonthDate(new Date(2026, 4, 1), referenceDate), false, "prior month date");
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
  console.log(`${passed} spending period tests passed.`);
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

function moneyTransfer(input: {
  amount: number;
  fromAccount: string;
  occurredAt: string;
  toAccount: string;
}): MoneyTransfer {
  return {
    amount: input.amount,
    createdAt: input.occurredAt,
    fromAccount: input.fromAccount,
    id: `transfer-${input.occurredAt}-${input.amount}`,
    occurredAt: input.occurredAt,
    toAccount: input.toAccount,
    updatedAt: input.occurredAt
  };
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