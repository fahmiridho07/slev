import {
  formatAmountInput,
  formatMomentAmount,
  formatSignedCompactRupiah,
  parseAmountInput
} from "../src/lib/formatMoney";
import { EntryType, SpendingMoment } from "../src/features/spendingMemory.types";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("parseAmountInput rejects empty, zero, and non-numeric input", () => {
  assertEqual(parseAmountInput(""), null, "empty string");
  assertEqual(parseAmountInput("abc"), null, "non-numeric");
  assertEqual(parseAmountInput("0"), null, "zero");
});

test("parseAmountInput accepts positive digit strings with separators", () => {
  assertEqual(parseAmountInput("50000"), 50000, "plain digits");
  assertEqual(parseAmountInput("50.000"), 50000, "thousand separators");
  assertEqual(parseAmountInput("Rp 1.250.000"), 1250000, "formatted currency text");
});

test("formatAmountInput groups thousands with dots", () => {
  assertEqual(formatAmountInput(""), "", "empty");
  assertEqual(formatAmountInput("5"), "5", "single digit");
  assertEqual(formatAmountInput("1000000"), "1.000.000", "millions");
  assertEqual(formatAmountInput("12.345"), "12.345", "strips non-digits then formats");
});

test("formatSignedCompactRupiah prefixes sign for non-zero amounts", () => {
  assertEqual(formatSignedCompactRupiah(50000), "+Rp 50.000", "positive");
  assertEqual(formatSignedCompactRupiah(-25000), "-Rp 25.000", "negative");
  assertEqual(formatSignedCompactRupiah(0), "Rp 0", "zero");
});

test("formatMomentAmount prefixes income with plus", () => {
  assertEqual(
    formatMomentAmount(spendingMoment({ amount: 12000, type: "expense" })),
    "Rp 12.000",
    "expense"
  );
  assertEqual(
    formatMomentAmount(spendingMoment({ amount: 12000, type: "income" })),
    "+Rp 12.000",
    "income"
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
    console.error(`${failures} formatMoney test${failures === 1 ? "" : "s"} failed.`);
    return;
  }

  console.log(`${tests.length} formatMoney tests passed.`);
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${printable(expected)}, got ${printable(actual)}.`);
  }
}

function spendingMoment(input: { amount: number; type: EntryType }): SpendingMoment {
  return {
    amount: input.amount,
    context: "Other",
    createdAt: "2026-06-01T00:00:00.000Z",
    id: `moment-${input.type}-${input.amount}`,
    occurredAt: "2026-06-01T00:00:00.000Z",
    type: input.type,
    updatedAt: "2026-06-01T00:00:00.000Z"
  };
}

function printable(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value);
}