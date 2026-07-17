process.env.TZ = "Asia/Jakarta";

import { SpendingMoment } from "../src/features/spendingMemory.types";
import {
  buildCashflowTrend,
  buildCategoryMonthDeltas,
  getSavingsRate,
  getTopCategoryIncreases
} from "../src/lib/monthInsights";

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];
const baseDate = new Date(2026, 5, 15, 12, 0);

test("buildCategoryMonthDeltas compares this month against last month", () => {
  const deltas = buildCategoryMonthDeltas(
    [
      moment({ amount: 300_000, context: "Meal", occurredAt: new Date(2026, 5, 4).toISOString() }),
      moment({ amount: 200_000, context: "Meal", occurredAt: new Date(2026, 4, 4).toISOString() }),
      moment({ amount: 90_000, context: "Coffee", occurredAt: new Date(2026, 4, 6).toISOString() }),
      moment({ amount: 50_000, context: "Treat", occurredAt: new Date(2026, 5, 6).toISOString() })
    ],
    0,
    baseDate
  );

  assertEqual(deltas.length, 3, "delta count");
  assertEqual(deltas[0].context, "Meal", "largest increase first");
  assertEqual(deltas[0].deltaAmount, 100_000, "meal delta");
  assertEqual(deltas[0].deltaPercent, 0.5, "meal percent");

  const treat = deltas.find((delta) => delta.context === "Treat");
  assertEqual(treat?.deltaPercent, null, "new category has null percent");

  const coffee = deltas.find((delta) => delta.context === "Coffee");
  assertEqual(coffee?.deltaAmount, -90_000, "quiet category shrinks");
});

test("getTopCategoryIncreases keeps only positive movers", () => {
  const deltas = buildCategoryMonthDeltas(
    [
      moment({ amount: 300_000, context: "Meal", occurredAt: new Date(2026, 5, 4).toISOString() }),
      moment({ amount: 200_000, context: "Meal", occurredAt: new Date(2026, 4, 4).toISOString() }),
      moment({ amount: 90_000, context: "Coffee", occurredAt: new Date(2026, 4, 6).toISOString() })
    ],
    0,
    baseDate
  );
  const top = getTopCategoryIncreases(deltas);
  assertEqual(top.length, 1, "one increase");
  assertEqual(top[0].context, "Meal", "meal is top increase");
});

test("buildCashflowTrend returns trailing months oldest first and trims empty lead", () => {
  const points = buildCashflowTrend(
    [
      moment({ amount: 100_000, context: "Meal", occurredAt: new Date(2026, 3, 10).toISOString() }),
      moment({
        amount: 900_000,
        context: "Other",
        occurredAt: new Date(2026, 4, 1).toISOString(),
        type: "income"
      }),
      moment({ amount: 150_000, context: "Meal", occurredAt: new Date(2026, 5, 2).toISOString() })
    ],
    6,
    baseDate
  );

  assertEqual(points.length, 3, "trimmed to first active month");
  assertEqual(points[0].monthDate.getMonth(), 3, "starts in April");
  assertEqual(points[0].expense, 100_000, "april expense");
  assertEqual(points[1].income, 900_000, "may income");
  assertEqual(points[1].net, 900_000, "may net");
  assertEqual(points[2].net, -150_000, "june net");
});

test("getSavingsRate handles zero income", () => {
  assertEqual(getSavingsRate(0, 100_000), null, "no income");
  assertEqual(getSavingsRate(1_000_000, 750_000), 0.25, "kept a quarter");
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
  console.log(`${passed} month insights tests passed.`);
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
  context: string;
  occurredAt: string;
  type?: "expense" | "income";
}): SpendingMoment {
  return {
    amount: input.amount,
    context: input.context,
    createdAt: input.occurredAt,
    id: `moment-${input.occurredAt}-${input.amount}`,
    occurredAt: input.occurredAt,
    type: input.type ?? "expense",
    updatedAt: input.occurredAt
  };
}
