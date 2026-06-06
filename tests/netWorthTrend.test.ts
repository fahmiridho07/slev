process.env.TZ = "Asia/Jakarta";

import { BalanceSnapshot } from "../src/features/spendingMemory.types";
import { buildNetWorthTrend } from "../src/lib/financeEngine";

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("buildNetWorthTrend carry-forwards balances across irregular snapshot dates", () => {
  const trend = buildNetWorthTrend({
    balanceSnapshots: [
      snapshot("BRI", 1_000_000, "2026-01-15T00:00:00.000Z"),
      snapshot("Jago", 500_000, "2026-02-10T00:00:00.000Z")
    ]
  });

  assertEqual(trend.length, 2, "two snapshot dates");
  assertEqual(trend[0]?.total, 1_000_000, "first point uses only BRI");
  assertEqual(trend[1]?.total, 1_500_000, "second point carries BRI forward with Jago");
});

test("buildNetWorthTrend appends the projected today point", () => {
  const trend = buildNetWorthTrend({
    balanceSnapshots: [snapshot("BRI", 1_000_000, "2026-01-15T00:00:00.000Z")],
    projectedSnapshots: [
      snapshot("BRI", 1_200_000, "2026-06-06T12:00:00.000Z"),
      snapshot("Jago", 300_000, "2026-06-06T12:00:00.000Z")
    ]
  });

  assertEqual(trend.length, 2, "history plus today");
  assertEqual(trend[1]?.date, "2026-06-06T12:00:00.000Z", "today date");
  assertEqual(trend[1]?.total, 1_500_000, "today total from projected snapshots");
});

test("buildNetWorthTrend returns an empty series without snapshot history", () => {
  const trend = buildNetWorthTrend({
    balanceSnapshots: []
  });

  assertEqual(trend.length, 0, "no history should return empty");
});

test("buildNetWorthTrend respects maxPoints", () => {
  const balanceSnapshots = Array.from({ length: 15 }, (_, index) =>
    snapshot("BRI", 100_000 * (index + 1), `2026-01-${`${index + 1}`.padStart(2, "0")}T00:00:00.000Z`)
  );
  const trend = buildNetWorthTrend({
    balanceSnapshots,
    maxPoints: 12
  });

  assertEqual(trend.length, 12, "series should cap to maxPoints");
  assertEqual(trend[0]?.date, "2026-01-04T00:00:00.000Z", "oldest kept point should be fourth day");
  assertEqual(trend[11]?.date, "2026-01-15T00:00:00.000Z", "newest kept point should be fifteenth day");
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
  console.error("net worth trend tests failed.");
} else {
  console.log(`${tests.length} net worth trend tests passed.`);
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

function snapshot(accountLabel: string, amount: number, snapshotDate: string): BalanceSnapshot {
  return {
    accountLabel,
    amount,
    createdAt: snapshotDate,
    id: `snapshot-${accountLabel}-${snapshotDate}`,
    snapshotDate
  };
}