import { RecurringBill } from "../src/features/spendingMemory.types";
import { getBillsReserve, getMonthlyBillsTotal } from "../src/lib/recurringBills";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("getMonthlyBillsTotal sums only active bills", () => {
  const total = getMonthlyBillsTotal([
    buildBill({ label: "Active", amount: 250_000, active: true }),
    buildBill({ label: "Paused", amount: 900_000, active: false })
  ]);

  assertEqual(total, 250_000, "paused bills should be excluded");
});

test("getMonthlyBillsTotal returns zero for empty list", () => {
  assertEqual(getMonthlyBillsTotal([]), 0, "empty bills");
});

test("getBillsReserve keeps bills without dueDay fully reserved", () => {
  const reserve = getBillsReserve(
    [buildBill({ label: "Internet", amount: 300_000, active: true })],
    new Date(2026, 5, 8, 12, 0)
  );

  assertEqual(reserve, 300_000, "undated bills stay fully reserved");
});

test("getBillsReserve only keeps due bills inside the month-end horizon", () => {
  const referenceDate = new Date(2026, 5, 8, 12, 0);
  const reserve = getBillsReserve(
    [
      buildBill({ label: "Due soon", amount: 100_000, active: true, dueDay: 20 }),
      buildBill({ label: "Already paid", amount: 200_000, active: true, dueDay: 5 })
    ],
    referenceDate
  );

  assertEqual(reserve, 100_000, "passed due day should not reserve again this cycle");
});

test("getBillsReserve uses payday horizon when configured", () => {
  const referenceDate = new Date(2026, 5, 8, 12, 0);
  const reserve = getBillsReserve(
    [
      buildBill({ label: "Before payday", amount: 150_000, active: true, dueDay: 20 }),
      buildBill({ label: "After payday", amount: 250_000, active: true, dueDay: 28 })
    ],
    referenceDate,
    25
  );

  assertEqual(reserve, 150_000, "only bills due on or before payday should reserve");
});

test("getMonthlyBillsTotal returns zero when all bills are inactive", () => {
  const total = getMonthlyBillsTotal([
    buildBill({ label: "Paused A", amount: 100_000, active: false }),
    buildBill({ label: "Paused B", amount: 200_000, active: false })
  ]);

  assertEqual(total, 0, "all inactive");
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
  label: string;
  amount: number;
  active?: boolean;
  dueDay?: number;
}): RecurringBill {
  const now = "2026-01-01T00:00:00.000Z";
  return {
    id: `bill-${input.label}`,
    label: input.label,
    amount: input.amount,
    active: input.active ?? true,
    ...(input.dueDay !== undefined ? { dueDay: input.dueDay } : {}),
    createdAt: now,
    updatedAt: now
  };
}