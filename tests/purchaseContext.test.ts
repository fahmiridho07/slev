import { getPurchaseCategoryMatch } from "../src/lib/purchaseContext";
import { SpendingMoment } from "../src/features/spendingMemory.types";
import { en } from "../src/i18n/en";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];
const referenceDate = new Date("2026-06-15T08:00:00.000Z");

test("getPurchaseCategoryMatch surfaces a coffee multiple when history exists", () => {
  const match = getPurchaseCategoryMatch({
    amount: 50_000,
    moments: coffeeMoments(25_000, 4),
    referenceDate,
    strings: en
  });

  assertEqual(match?.category, "Coffee", "category");
  assertEqual(match?.multiple, 2, "multiple");
  assertEqual(match?.categoryLabel, "Coffee", "label");
});

test("getPurchaseCategoryMatch returns null without enough category history", () => {
  const match = getPurchaseCategoryMatch({
    amount: 50_000,
    moments: coffeeMoments(25_000, 1),
    referenceDate,
    strings: en
  });

  assertEqual(match, null, "no match");
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
  console.log(`${passed} purchase context tests passed.`);
}

function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}.`);
  }
}

function coffeeMoments(amount: number, count: number): SpendingMoment[] {
  const moments: SpendingMoment[] = [];
  for (let index = 0; index < count; index += 1) {
    const day = String(10 + index).padStart(2, "0");
    moments.push({
      amount,
      context: "Coffee",
      createdAt: "2026-06-01T00:00:00.000Z",
      id: `coffee-${index}`,
      occurredAt: `2026-06-${day}T08:00:00.000Z`,
      type: "expense",
      updatedAt: "2026-06-01T00:00:00.000Z"
    });
  }
  return moments;
}