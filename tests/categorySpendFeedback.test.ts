process.env.TZ = "Asia/Jakarta";

import { ExpenseCategory, SpendingMoment } from "../src/features/spendingMemory.types";
import { buildCategorySpendFeedback } from "../src/lib/categorySpendFeedback";

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];
const referenceDate = new Date(2026, 5, 15, 12, 0);

test("sums only same-category expenses in the reference month", () => {
  const feedback = buildCategorySpendFeedback({
    categories: [],
    context: "Meal",
    moments: [
      moment({ amount: 50_000, context: "Meal", occurredAt: new Date(2026, 5, 3).toISOString() }),
      moment({ amount: 30_000, context: "Meal", occurredAt: new Date(2026, 5, 10).toISOString() }),
      moment({ amount: 99_000, context: "Coffee", occurredAt: new Date(2026, 5, 10).toISOString() }),
      moment({ amount: 70_000, context: "Meal", occurredAt: new Date(2026, 4, 20).toISOString() }),
      moment({
        amount: 500_000,
        context: "Meal",
        occurredAt: new Date(2026, 5, 5).toISOString(),
        type: "income"
      })
    ],
    referenceDate
  });

  assertEqual(feedback.spentThisMonth, 80_000, "spent this month");
  assertEqual(feedback.monthlyGuide, null, "no guide");
  assertEqual(feedback.remainingAfterDraft, null, "no remaining without guide");
  assertEqual(feedback.overBy, null, "no over without guide");
});

test("reports remaining guide amount including the draft", () => {
  const feedback = buildCategorySpendFeedback({
    categories: [category("Meal", 500_000)],
    context: "Meal",
    draftAmount: 100_000,
    moments: [moment({ amount: 250_000, context: "Meal", occurredAt: new Date(2026, 5, 8).toISOString() })],
    referenceDate
  });

  assertEqual(feedback.monthlyGuide, 500_000, "guide");
  assertEqual(feedback.remainingAfterDraft, 150_000, "remaining after draft");
  assertEqual(feedback.overBy, null, "not over");
});

test("reports overBy when spending passes the guide", () => {
  const feedback = buildCategorySpendFeedback({
    categories: [category("Meal", 200_000)],
    context: "Meal",
    draftAmount: 80_000,
    moments: [moment({ amount: 180_000, context: "Meal", occurredAt: new Date(2026, 5, 8).toISOString() })],
    referenceDate
  });

  assertEqual(feedback.remainingAfterDraft, -60_000, "negative remaining");
  assertEqual(feedback.overBy, 60_000, "over by");
});

test("ignores non-positive guides", () => {
  const feedback = buildCategorySpendFeedback({
    categories: [category("Meal", 0)],
    context: "Meal",
    moments: [],
    referenceDate
  });

  assertEqual(feedback.monthlyGuide, null, "zero guide ignored");
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
  console.log(`${passed} category spend feedback tests passed.`);
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

function category(label: string, monthlyGuide?: number): ExpenseCategory {
  return {
    createdAt: "2026-01-01T00:00:00.000Z",
    id: `category-${label}`,
    isDefault: true,
    label,
    monthlyGuide,
    updatedAt: "2026-01-01T00:00:00.000Z"
  };
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
