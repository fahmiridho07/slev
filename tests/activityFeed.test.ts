process.env.TZ = "Asia/Jakarta";

import { buildMonthActivityFeed, filterActivityFeed, getTransferActivityTitle } from "../src/lib/activityFeed";
import { EntryType, MoneyTransfer, SpendingMoment } from "../src/features/spendingMemory.types";

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

test("buildMonthActivityFeed merges moments and transfers for the selected month", () => {
  const items = buildMonthActivityFeed(
    [
      moment({ amount: 50_000, occurredAt: new Date(2026, 5, 10).toISOString() }),
      moment({ amount: 75_000, occurredAt: new Date(2026, 4, 10).toISOString() })
    ],
    [
      transfer({
        amount: 100_000,
        occurredAt: new Date(2026, 5, 12).toISOString(),
        fromAccount: "BRI",
        toAccount: "Jago"
      })
    ],
    referenceDate
  );

  assertEqual(items.length, 2, "item count");
  assertEqual(items[0]?.kind, "transfer", "newest item kind");
  assertEqual(items[1]?.kind, "moment", "second item kind");
});

test("filterActivityFeed matches transfer accounts", () => {
  const items = buildMonthActivityFeed(
    [],
    [
      transfer({
        amount: 100_000,
        occurredAt: new Date(2026, 5, 12).toISOString(),
        fromAccount: "BRI",
        toAccount: "Jago"
      })
    ],
    referenceDate
  );

  const filtered = filterActivityFeed(items, "jago");
  assertEqual(filtered.length, 1, "filtered count");
  const transferItem = filtered[0];
  assertEqual(transferItem?.kind, "transfer", "filtered kind");
  assertEqual(
    transferItem?.kind === "transfer" ? getTransferActivityTitle(transferItem.transfer) : "",
    "BRI → Jago",
    "transfer title"
  );
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
  console.log(`${passed} activity feed tests passed.`);
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
  occurredAt: string;
  type?: EntryType;
}): SpendingMoment {
  return {
    amount: input.amount,
    context: "Food",
    createdAt: input.occurredAt,
    id: `moment-${input.occurredAt}`,
    occurredAt: input.occurredAt,
    type: input.type ?? "expense",
    updatedAt: input.occurredAt
  };
}

function transfer(input: {
  amount: number;
  fromAccount: string;
  occurredAt: string;
  toAccount: string;
}): MoneyTransfer {
  return {
    amount: input.amount,
    createdAt: input.occurredAt,
    fromAccount: input.fromAccount,
    id: `transfer-${input.occurredAt}`,
    occurredAt: input.occurredAt,
    toAccount: input.toAccount,
    updatedAt: input.occurredAt
  };
}