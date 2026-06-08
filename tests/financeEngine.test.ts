import { buildMonthlyBreakdown, getDaysRemainingInMonth } from "../src/lib/financeEngine";
import {
  buildSafeToSpend,
  getEffectiveBalance,
  simulatePurchase
} from "../src/lib/safeToSpend";
import {
  EntryType,
  SpendingContext,
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
const juneMidpoint = new Date("2026-06-15T08:00:00.000Z");

test("breakdown groups current-month expenses and calculates shares", () => {
  const rows = buildMonthlyBreakdown(
    [
      moment({ amount: 600_000, context: "Meal", occurredAt: "2026-06-01T01:00:00.000Z" }),
      moment({ amount: 400_000, context: "Transport", occurredAt: "2026-06-02T01:00:00.000Z" }),
      moment({ amount: 500_000, context: "Meal", occurredAt: "2026-05-01T01:00:00.000Z" })
    ],
    "expense",
    juneMidpoint
  );

  assertEqual(rows.length, 2, "breakdown should include two June categories");
  assertEqual(rows[0]?.label, "Meal", "largest row should be first");
  assertEqual(rows[0]?.amount, 600_000, "Meal amount should be grouped");
  assertEqual(rows[0]?.share, 0.6, "Meal share should be 60%");
});

test("getEffectiveBalance returns null without balance anchor", () => {
  const balance = getEffectiveBalance({
    balanceAnchor: null,
    moments: [],
    referenceDate: juneMidpoint
  });

  assertEqual(balance, null, "missing anchor should surface a set-balance state");
});

test("getEffectiveBalance totals anchor plus net moments since setAt", () => {
  const balance = getEffectiveBalance({
    balanceAnchor: balanceAnchor(1_000_000, "2026-06-10T12:00:00.000Z"),
    moments: [
      moment({ amount: 50_000, occurredAt: "2026-06-09T12:00:00.000Z" }),
      moment({ amount: 100_000, accountLabel: "GoPay", occurredAt: "2026-06-12T12:00:00.000Z" }),
      moment({ amount: 200_000, occurredAt: "2026-06-13T12:00:00.000Z", source: "Bonus", type: "income" })
    ],
    referenceDate: juneMidpoint
  });

  assertEqual(balance, 1_100_000, "effective balance should add income and subtract expenses after setAt");
});

test("buildSafeToSpend computes safeDaily from effective balance and days left", () => {
  const daysLeft = getDaysRemainingInMonth(juneMidpoint);
  const safe = buildSafeToSpend({
    balanceAnchor: balanceAnchor(1_600_000, "2026-06-15T01:00:00.000Z"),
    moments: [],
    referenceDate: juneMidpoint
  });

  assertEqual(safe.effectiveBalance, 1_600_000, "effective balance should use the total anchor");
  assertEqual(safe.daysLeft, daysLeft, "days left should default to month remainder");
  assertEqual(safe.safeDaily, Math.round(1_600_000 / daysLeft), "safeDaily should divide balance by days left");
});

test("buildSafeToSpend classifies spending pace against safeDaily", () => {
  const daysLeft = getDaysRemainingInMonth(juneMidpoint);
  const baseArgs = {
    balanceAnchor: balanceAnchor(1_000_000, "2026-06-15T08:00:00.000Z"),
    referenceDate: juneMidpoint,
    windowDays: 10
  };
  const safeDaily = Math.round(1_000_000 / daysLeft);

  const underSpend = buildSafeToSpend({
    ...baseArgs,
    moments: trailingExpenseMoments(safeDaily - 20_000, 10, juneMidpoint)
  });
  const overSpend = buildSafeToSpend({
    ...baseArgs,
    moments: trailingExpenseMoments(safeDaily + 20_000, 10, juneMidpoint)
  });
  const evenSpend = buildSafeToSpend({
    ...baseArgs,
    moments: trailingExpenseMoments(safeDaily, 10, juneMidpoint)
  });
  const unknownSpend = buildSafeToSpend({
    balanceAnchor: null,
    moments: [],
    referenceDate: juneMidpoint
  });

  assertEqual(underSpend.pace, "under", "lower typical spend should pace under safeDaily");
  assertEqual(overSpend.pace, "over", "higher typical spend should pace over safeDaily");
  assertEqual(evenSpend.pace, "even", "matching typical spend should pace even");
  assertEqual(unknownSpend.pace, "unknown", "missing balance should hide pace");
  assertEqual(unknownSpend.safeDaily, null, "safeDaily should be null without balance evidence");
});

test("simulatePurchase rejects purchases that break daily coverage even when balance remains", () => {
  const safe = buildSafeToSpend({
    balanceAnchor: balanceAnchor(1_000_000, "2026-06-15T01:00:00.000Z"),
    moments: trailingExpenseMoments(50_000, 10, juneMidpoint),
    referenceDate: juneMidpoint,
    windowDays: 10
  });
  const typicalNeed = safe.typicalDaily * safe.daysLeft;

  const tightPurchase = simulatePurchase({ amount: 300_000, safe });
  const comfortablePurchase = simulatePurchase({ amount: 100_000, safe });

  assertEqual(tightPurchase.remainingBalance, 700_000, "purchase should reduce remaining balance");
  assertEqual(tightPurchase.remainingBalance >= 0, true, "purchase should still leave non-negative balance");
  assertEqual(tightPurchase.remainingBalance < typicalNeed, true, "remaining cash should fall short of typical daily needs");
  assertEqual(tightPurchase.coversTypicalDays, false, "remaining cash should not cover typical daily needs");
  assertEqual(tightPurchase.affordable, false, "affordable requires balance and daily coverage");
  assertEqual(comfortablePurchase.affordable, true, "smaller purchase should stay affordable");
  assertEqual(
    comfortablePurchase.newSafeDaily,
    Math.max(0, Math.round(900_000 / safe.daysLeft)),
    "newSafeDaily should recompute from remaining balance"
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
    console.error(`${failures} finance engine test${failures === 1 ? "" : "s"} failed.`);
    return;
  }

  console.log(`${tests.length} finance engine tests passed.`);
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${printable(expected)}, got ${printable(actual)}.`);
  }
}

function moment(input: {
  accountLabel?: string;
  amount: number;
  context?: SpendingContext;
  label?: string;
  occurredAt: string;
  source?: string;
  type?: EntryType;
}): SpendingMoment {
  return {
    accountLabel: input.accountLabel,
    amount: input.amount,
    context: input.context ?? "Other",
    createdAt: input.occurredAt,
    id: `moment-${input.occurredAt}-${input.amount}-${input.context ?? "Other"}`,
    label: input.label,
    note: undefined,
    occurredAt: input.occurredAt,
    source: input.source,
    type: input.type ?? "expense",
    updatedAt: input.occurredAt
  };
}

function printable(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value);
}

function balanceAnchor(amount: number, setAt: string) {
  return { amount, setAt };
}

function trailingExpenseMoments(dailyAmount: number, dayCount: number, referenceDate: Date): SpendingMoment[] {
  const moments: SpendingMoment[] = [];
  const windowEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  for (let offset = 1; offset <= dayCount; offset += 1) {
    const day = new Date(windowEnd);
    day.setDate(day.getDate() - offset);
    moments.push(
      moment({
        amount: dailyAmount,
        context: "Meal",
        occurredAt: day.toISOString()
      })
    );
  }

  return moments;
}