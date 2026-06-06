process.env.TZ = "Asia/Jakarta";

import { EntryType, SpendingContext, SpendingMoment } from "../src/features/spendingMemory.types";
import {
  buildCashflowWeeks,
  dateKey,
  getMonthRange,
  getStartOfWeek,
  getWeekRange,
  groupMomentsByRecallRange,
  isWithinRange
} from "../src/lib/analysis";
import { buildCurrentMonthSummary, buildMonthlyBreakdown } from "../src/lib/financeEngine";

declare const process: {
  env: Record<string, string | undefined>;
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("month bucketing respects Jakarta local month boundaries", () => {
  const referenceDate = new Date(2026, 5, 15, 12, 0);
  const monthEndNight = new Date(2026, 4, 31, 23, 30).toISOString();
  const monthStartMorning = new Date(2026, 5, 1, 0, 30).toISOString();

  const summary = buildCurrentMonthSummary(
    [
      moment({ amount: 50_000, occurredAt: monthEndNight }),
      moment({ amount: 75_000, occurredAt: monthStartMorning })
    ],
    [],
    referenceDate
  );
  const breakdown = buildMonthlyBreakdown(
    [
      moment({ amount: 50_000, occurredAt: monthEndNight }),
      moment({ amount: 75_000, occurredAt: monthStartMorning })
    ],
    "expense",
    referenceDate
  );

  assertEqual(summary.expense, 75_000, "May 31 23:30 local stays out of June");
  assertEqual(breakdown.reduce((sum, row) => sum + row.amount, 0), 75_000, "June breakdown excludes prior month");
});

test("groupMomentsByRecallRange classifies today and yesterday around local midnight", () => {
  const now = new Date();
  const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0).toISOString();
  const yesterdayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 12, 0).toISOString();

  const groups = groupMomentsByRecallRange([
    moment({ amount: 10_000, occurredAt: todayNoon, id: "today-moment" }),
    moment({ amount: 20_000, occurredAt: yesterdayNoon, id: "yesterday-moment" })
  ]);

  const todayGroup = groups.find((group) => group.key === "today");
  const yesterdayGroup = groups.find((group) => group.key === "yesterday");

  assertEqual(todayGroup?.items[0]?.id, "today-moment", "today bucket");
  assertEqual(yesterdayGroup?.items[0]?.id, "yesterday-moment", "yesterday bucket");
  assertEqual(dateKey(new Date(todayNoon)), dateKey(now), "today key matches local calendar day");
});

test("week bucketing places Sunday night and Monday morning into the correct Monday-start weeks", () => {
  const thisMonday = getStartOfWeek(new Date());
  const sundayNight = new Date(thisMonday.getTime() - 30 * 60 * 1000);
  const mondayMorning = new Date(thisMonday.getTime() + 30 * 60 * 1000);

  const mondayWeek = getWeekRange(mondayMorning);
  const sundayWeek = getWeekRange(sundayNight);

  assertEqual(getStartOfWeek(mondayMorning).getDay(), 1, "week starts on Monday");
  assertEqual(
    isWithinRange(sundayNight.toISOString(), sundayWeek.start, sundayWeek.end),
    true,
    "Sunday night stays in its week"
  );
  assertEqual(
    isWithinRange(mondayMorning.toISOString(), mondayWeek.start, mondayWeek.end),
    true,
    "Monday morning is in the new week"
  );
  assertEqual(
    isWithinRange(sundayNight.toISOString(), mondayWeek.start, mondayWeek.end),
    false,
    "Sunday night is not in Monday's week"
  );

  const weeks = buildCashflowWeeks([
    moment({ amount: 11_000, occurredAt: sundayNight.toISOString(), id: "sun" }),
    moment({ amount: 22_000, occurredAt: mondayMorning.toISOString(), id: "mon" })
  ]);
  const sundayWeekKey = dateKey(sundayWeek.start);
  const mondayWeekKey = dateKey(mondayWeek.start);
  const sundayBucket = weeks.find((week) => week.key === sundayWeekKey);
  const mondayBucket = weeks.find((week) => week.key === mondayWeekKey);

  assertEqual(sundayBucket?.expense, 11_000, "cashflow week keeps Sunday night expense");
  assertEqual(mondayBucket?.expense, 22_000, "cashflow week keeps Monday morning expense");
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
  console.error("date bucket tests failed.");
} else {
  console.log(`${tests.length} date bucket tests passed.`);
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
  context?: SpendingContext;
  id?: string;
  occurredAt: string;
  type?: EntryType;
}): SpendingMoment {
  return {
    amount: input.amount,
    context: input.context ?? "Other",
    createdAt: input.occurredAt,
    id: input.id ?? `moment-${input.occurredAt}-${input.amount}`,
    label: undefined,
    note: undefined,
    occurredAt: input.occurredAt,
    source: undefined,
    type: input.type ?? "expense",
    updatedAt: input.occurredAt
  };
}