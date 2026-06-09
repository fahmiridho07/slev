import { getHomeSetupHints } from "../src/lib/homeSetup";
import { MoneyAccount } from "../src/features/spendingMemory.types";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("getHomeSetupHints surfaces payday, opening balance, and bills setup", () => {
  const hints = getHomeSetupHints({
    accounts: [account("BRI")],
    moments: [],
    paydayDayOfMonth: null,
    recurringBills: [],
    transfers: []
  });

  assertEqual(
    hints.map((hint) => hint.type).join(","),
    "payday,opening_balance,bills",
    "setup hints"
  );
});

test("getHomeSetupHints includes overdue bills when due day passed without payment", () => {
  const hints = getHomeSetupHints({
    accounts: [account("BRI", 1_000_000)],
    moments: [],
    paydayDayOfMonth: 25,
    recurringBills: [
      {
        active: true,
        amount: 200_000,
        createdAt: "2026-01-01T00:00:00.000Z",
        dueDay: 5,
        id: "bill-1",
        label: "Internet",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    ],
    transfers: []
  });

  assertEqual(hints.some((hint) => hint.type === "overdue_bills"), true, "overdue hint");
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
  console.log(`${passed} home setup tests passed.`);
}

function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}.`);
  }
}

function account(label: string, openingBalance = 0): MoneyAccount {
  const now = "2026-06-01T00:00:00.000Z";
  return {
    createdAt: now,
    id: `account-${label}`,
    isIncomeHub: label === "BRI",
    kind: "bank",
    label,
    openingBalance,
    openingSetAt: now,
    updatedAt: now
  };
}