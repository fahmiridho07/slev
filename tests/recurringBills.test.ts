process.env.TZ = "Asia/Jakarta";

import { RecurringBill } from "../src/features/spendingMemory.types";
import { getMonthlyBillsTotal, getUpcomingBills } from "../src/lib/recurringBills";

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("getUpcomingBills includes a bill due today", () => {
  const referenceDate = new Date(2026, 5, 10, 12, 0);
  const upcoming = getUpcomingBills({
    bills: [buildBill({ label: "Internet", amount: 300_000, dayOfMonth: 10 })],
    referenceDate
  });

  assertEqual(upcoming.length, 1, "today bill count");
  assertEqual(upcoming[0]?.daysUntil, 0, "due today");
  assertEqual(upcoming[0]?.bill.label, "Internet", "bill label");
});

test("getUpcomingBills excludes bills outside the horizon", () => {
  const referenceDate = new Date(2026, 5, 1, 12, 0);
  const upcoming = getUpcomingBills({
    bills: [buildBill({ label: "Rent", amount: 2_000_000, dayOfMonth: 25 })],
    horizonDays: 14,
    referenceDate
  });

  assertEqual(upcoming.length, 0, "bill beyond 14 days should be hidden");
});

test("getUpcomingBills rolls forward when this cycle is already paid", () => {
  const referenceDate = new Date(2026, 5, 28, 12, 0);
  const upcoming = getUpcomingBills({
    bills: [
      buildBill({
        label: "Internet",
        amount: 300_000,
        dayOfMonth: 10,
        lastPaidMonth: "2026-06"
      })
    ],
    referenceDate
  });

  assertEqual(upcoming.length, 1, "paid bill should show next cycle");
  assertEqual(upcoming[0]?.daysUntil, 12, "next cycle should be July 10");
});

test("getUpcomingBills rolls to next month when this month's due date has passed", () => {
  const referenceDate = new Date(2026, 5, 25, 12, 0);
  const upcoming = getUpcomingBills({
    bills: [buildBill({ label: "Utilities", amount: 400_000, dayOfMonth: 5 })],
    referenceDate
  });

  assertEqual(upcoming.length, 1, "past due date should roll to next month");
  assertEqual(upcoming[0]?.daysUntil, 10, "July 5 from June 25");
});

test("getUpcomingBills clamps day-of-month for short months", () => {
  const referenceDate = new Date(2026, 1, 20, 12, 0);
  const upcoming = getUpcomingBills({
    bills: [buildBill({ label: "Lease", amount: 1_000_000, dayOfMonth: 31 })],
    referenceDate
  });

  assertEqual(upcoming.length, 1, "February bill should still appear");
  assertEqual(new Date(upcoming[0]?.dueDate ?? "").getDate(), 28, "day 31 should clamp to Feb 28");
});

test("getUpcomingBills sorts ascending by due date", () => {
  const referenceDate = new Date(2026, 5, 1, 12, 0);
  const upcoming = getUpcomingBills({
    bills: [
      buildBill({ id: "later", label: "Later", amount: 100_000, dayOfMonth: 12 }),
      buildBill({ id: "sooner", label: "Sooner", amount: 200_000, dayOfMonth: 5 })
    ],
    referenceDate
  });

  assertEqual(upcoming[0]?.bill.label, "Sooner", "earlier due date first");
  assertEqual(upcoming[1]?.bill.label, "Later", "later due date second");
});

test("getMonthlyBillsTotal sums only active bills", () => {
  const total = getMonthlyBillsTotal([
    buildBill({ label: "Active", amount: 250_000, dayOfMonth: 1, active: true }),
    buildBill({ label: "Paused", amount: 900_000, dayOfMonth: 2, active: false })
  ]);

  assertEqual(total, 250_000, "paused bills should be excluded");
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
  console.error("recurring bills tests failed.");
} else {
  console.log(`${tests.length} recurring bills tests passed.`);
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

function buildBill(input: {
  id?: string;
  label: string;
  amount: number;
  dayOfMonth: number;
  active?: boolean;
  lastPaidMonth?: string;
}): RecurringBill {
  const now = "2026-01-01T00:00:00.000Z";
  return {
    id: input.id ?? `bill-${input.label}`,
    label: input.label,
    amount: input.amount,
    context: "Bills",
    dayOfMonth: input.dayOfMonth,
    active: input.active ?? true,
    lastPaidMonth: input.lastPaidMonth,
    createdAt: now,
    updatedAt: now
  };
}