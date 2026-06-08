import {
  getAccountBalance,
  getAccountBalances,
  getTrackedTotalBalance
} from "../src/lib/accountLedger";
import {
  EntryType,
  MoneyAccount,
  MoneyTransfer,
  SpendingMoment
} from "../src/features/spendingMemory.types";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];
const openingSetAt = "2026-06-01T00:00:00.000Z";

test("getAccountBalance returns opening balance without moments", () => {
  const account = moneyAccount({ label: "BRI", openingBalance: 1_500_000, openingSetAt });
  assertEqual(getAccountBalance(account, [], []), 1_500_000, "opening-only balance");
});

test("getAccountBalance applies income and expense after openingSetAt", () => {
  const account = moneyAccount({ label: "BRI", openingBalance: 1_000_000, openingSetAt });
  const balance = getAccountBalance(account, [
    moment({ amount: 200_000, occurredAt: "2026-06-02T00:00:00.000Z", type: "income" }),
    moment({ amount: 50_000, occurredAt: "2026-06-03T00:00:00.000Z", type: "expense" })
  ], []);

  assertEqual(balance, 1_150_000, "income and expense after opening");
});

test("getAccountBalance ignores moments before openingSetAt", () => {
  const account = moneyAccount({ label: "BRI", openingBalance: 1_000_000, openingSetAt });
  const balance = getAccountBalance(account, [
    moment({ amount: 500_000, occurredAt: "2026-05-31T23:59:59.000Z", type: "income" }),
    moment({ amount: 100_000, occurredAt: "2026-06-02T00:00:00.000Z", type: "expense" })
  ], []);

  assertEqual(balance, 900_000, "pre-opening moment ignored");
});

test("transfer moves balance between accounts without changing tracked total", () => {
  const accountA = moneyAccount({ label: "BRI", openingBalance: 1_000_000, openingSetAt });
  const accountB = moneyAccount({ index: 1, label: "Jago", openingBalance: 200_000, openingSetAt });
  const transfer: MoneyTransfer = {
    id: "transfer-1",
    amount: 300_000,
    fromAccount: "BRI",
    toAccount: "Jago",
    occurredAt: "2026-06-02T00:00:00.000Z",
    createdAt: "2026-06-02T00:00:00.000Z",
    updatedAt: "2026-06-02T00:00:00.000Z"
  };

  const balances = getAccountBalances([accountA, accountB], [], [transfer]);
  const total = getTrackedTotalBalance([accountA, accountB], [], [transfer]);

  assertEqual(balances[0]?.balance, 700_000, "sender balance reduced");
  assertEqual(balances[1]?.balance, 500_000, "receiver balance increased");
  assertEqual(total, 1_200_000, "tracked total unchanged by transfer");
});

test("getTrackedTotalBalance excludes ephemeral accounts", () => {
  const tracked = moneyAccount({ label: "BRI", openingBalance: 1_000_000, openingSetAt });
  const ephemeral = moneyAccount({
    index: 1,
    label: "Temp",
    openingBalance: 500_000,
    openingSetAt,
    tier: "ephemeral"
  });

  const total = getTrackedTotalBalance([tracked, ephemeral], [], []);
  assertEqual(total, 1_000_000, "ephemeral account excluded from total");
});

void runTests();

async function runTests(): Promise<void> {
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
    console.error("account ledger tests failed.");
  } else {
    console.log(`${tests.length} account ledger tests passed.`);
  }
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

function moneyAccount(input: {
  index?: number;
  label: string;
  openingBalance: number;
  openingSetAt: string;
  tier?: MoneyAccount["tier"];
}): MoneyAccount {
  const index = input.index ?? 0;
  const createdAt = "2026-01-01T00:00:00.000Z";
  return {
    createdAt,
    id: `account-${index}`,
    isIncomeHub: index === 0,
    kind: "bank",
    label: input.label,
    openingBalance: input.openingBalance,
    openingSetAt: input.openingSetAt,
    tier: input.tier,
    updatedAt: createdAt
  };
}

function moment(input: {
  amount: number;
  occurredAt: string;
  type?: EntryType;
}): SpendingMoment {
  return {
    accountLabel: "BRI",
    amount: input.amount,
    context: "Other",
    createdAt: input.occurredAt,
    id: `moment-${input.occurredAt}-${input.amount}`,
    occurredAt: input.occurredAt,
    type: input.type ?? "expense",
    updatedAt: input.occurredAt
  };
}