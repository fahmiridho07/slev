import { EntryType, SpendingContext, SpendingMoment } from "../src/features/spendingMemory.types";
import { generateSpendingPatterns } from "../src/lib/spendingMemoryPatterns";

declare const process: {
  exitCode?: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

function test(name: string, run: () => void) {
  tests.push({ name, run });
}

function daysAgo(days: number): string {
  return new Date(Date.now() - days * DAY_MS).toISOString();
}

function moment(input: {
  amount: number;
  context?: SpendingContext;
  label?: string;
  occurredAt: string;
  type?: EntryType;
}): SpendingMoment {
  return {
    accountLabel: "Jago",
    amount: input.amount,
    context: input.context ?? "Meal",
    createdAt: input.occurredAt,
    id: `moment-${input.occurredAt}-${input.amount}`,
    label: input.label,
    note: undefined,
    occurredAt: input.occurredAt,
    source: undefined,
    type: input.type ?? "expense",
    updatedAt: input.occurredAt
  };
}

function assertEqual<T>(actual: T, expected: T, label: string) {
  const actualJson = JSON.stringify(actual);
  const expectedJson = JSON.stringify(expected);
  if (actualJson !== expectedJson) {
    throw new Error(`${label}: expected ${expectedJson}, got ${actualJson}`);
  }
}

test("generateSpendingPatterns returns empty without expenses", () => {
  assertEqual(generateSpendingPatterns([]).length, 0, "empty moments");
  assertEqual(
    generateSpendingPatterns([moment({ amount: 50000, occurredAt: daysAgo(2), type: "income" })]).length,
    0,
    "income only"
  );
});

test("generateSpendingPatterns returns quiet-start for sparse expense history", () => {
  const patterns = generateSpendingPatterns([moment({ amount: 15000, occurredAt: daysAgo(1), label: "Snack" })]);
  assertEqual(patterns.length, 1, "one pattern");
  assertEqual(patterns[0]?.id, "quiet-start", "quiet-start id");
});

test("generateSpendingPatterns returns at most five patterns", () => {
  const patterns = generateSpendingPatterns(
    Array.from({ length: 12 }, (_, index) =>
      moment({
        amount: 20000 + index * 1000,
        context: index % 2 === 0 ? "Meal" : "Coffee",
        label: `Spend ${index}`,
        occurredAt: daysAgo(index % 5)
      })
    )
  );
  if (patterns.length > 5) {
    throw new Error(`expected at most 5 patterns, got ${patterns.length}`);
  }
  if (patterns.length === 0) {
    throw new Error("expected at least one generated pattern");
  }
});

test("generateSpendingPatterns ignores income when building recap patterns", () => {
  const patterns = generateSpendingPatterns([
    moment({ amount: 1000000, occurredAt: daysAgo(1), type: "income", label: "Salary" }),
    moment({ amount: 12000, occurredAt: daysAgo(1), label: "Snack" })
  ]);
  assertEqual(patterns[0]?.id, "quiet-start", "still quiet-start with one expense");
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
  console.log(`${passed} spending memory pattern tests passed.`);
}