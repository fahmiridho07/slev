import {
  buildMonthlyBreakdown,
  buildMonthlyIncomeBySource,
  getDaysRemainingInMonth,
  getDaysUntilNextPayday,
  getNextOccurrenceOfDay,
  getNextPaydayDate
} from "../src/lib/financeEngine";
import {
  buildSafeToSpend,
  getEffectiveBalance,
  getTypicalDailySpend,
  simulatePurchase
} from "../src/lib/safeToSpend";
import {
  EntryType,
  MoneyAccount,
  MoneyTransfer,
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
const defaultOpeningSetAt = "2026-01-01T00:00:00.000Z";

test("getDaysUntilNextPayday counts days until the next payday", () => {
  const referenceDate = new Date(2026, 5, 8, 12, 0);

  assertEqual(getDaysUntilNextPayday(referenceDate, 25), 17, "payday later this month");
  assertEqual(getDaysUntilNextPayday(referenceDate, 8), 30, "payday today rolls to next month");
  assertEqual(getDaysUntilNextPayday(referenceDate, 5), 27, "payday earlier this month rolls forward");
  assertEqual(getDaysUntilNextPayday(new Date(2026, 1, 15, 12, 0), 31), 13, "payday 31 clamps in February");
});

test("getNextPaydayDate and getNextOccurrenceOfDay handle month-end clamping", () => {
  const referenceDate = new Date(2026, 5, 8, 12, 0);

  assertEqual(getNextPaydayDate(referenceDate, 25).getDate(), 25, "next payday stays in June");
  assertEqual(getNextOccurrenceOfDay(referenceDate, 20).getDate(), 20, "bill due later this month");
  assertEqual(getNextOccurrenceOfDay(referenceDate, 8).getDate(), 8, "bill due today stays today");
  assertEqual(getNextOccurrenceOfDay(referenceDate, 5).getMonth(), 6, "passed due day rolls to July");
});

test("buildSafeToSpend uses payday horizon when payday is configured", () => {
  const referenceDate = new Date(2026, 5, 8, 12, 0);
  const safe = buildSafeToSpend({
    accounts: [hubAccount(1_000_000, "2026-06-08T01:00:00.000Z")],
    bills: [{ id: "b1", label: "Rent", amount: 200_000, active: true, dueDay: 20, createdAt: "x", updatedAt: "x" }],
    moments: [],
    transfers: [],
    referenceDate,
    paydayDayOfMonth: 25
  });

  assertEqual(safe.daysLeft, 17, "days left should follow payday horizon");
  assertEqual(safe.billsReserve, 200_000, "bill due before payday should stay reserved");
  assertEqual(safe.safeDaily, Math.round(800_000 / 17), "safeDaily should divide by payday days left");
});

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

test("breakdown groups current-month income by source and calculates shares", () => {
  const rows = buildMonthlyIncomeBySource(
    [
      moment({
        amount: 8_000_000,
        accountLabel: "BRI",
        occurredAt: "2026-06-01T01:00:00.000Z",
        source: "Salary",
        type: "income"
      }),
      moment({
        amount: 2_000_000,
        accountLabel: "Jago",
        occurredAt: "2026-06-02T01:00:00.000Z",
        source: "Freelance",
        type: "income"
      }),
      moment({
        amount: 1_000_000,
        accountLabel: "BRI",
        occurredAt: "2026-06-03T01:00:00.000Z",
        source: "Salary",
        type: "income"
      }),
      moment({
        amount: 500_000,
        accountLabel: "BRI",
        occurredAt: "2026-05-01T01:00:00.000Z",
        source: "Salary",
        type: "income"
      })
    ],
    juneMidpoint
  );

  assertEqual(rows.length, 2, "breakdown should include two June income sources");
  assertEqual(rows[0]?.label, "Salary", "largest source should be first");
  assertEqual(rows[0]?.amount, 9_000_000, "Salary amount should be grouped");
  assertEqual(rows[0]?.share, 9_000_000 / 11_000_000, "Salary share should reflect grouped total");
  assertEqual(rows[1]?.label, "Freelance", "second source should be Freelance");
});

test("breakdown groups current-month income by account and calculates shares", () => {
  const rows = buildMonthlyBreakdown(
    [
      moment({
        amount: 8_000_000,
        accountLabel: "BRI",
        occurredAt: "2026-06-01T01:00:00.000Z",
        source: "Salary",
        type: "income"
      }),
      moment({
        amount: 2_000_000,
        accountLabel: "Jago",
        occurredAt: "2026-06-02T01:00:00.000Z",
        source: "Freelance",
        type: "income"
      }),
      moment({
        amount: 1_000_000,
        occurredAt: "2026-06-03T01:00:00.000Z",
        source: "Salary",
        type: "income"
      }),
      moment({
        amount: 500_000,
        accountLabel: "BRI",
        occurredAt: "2026-05-01T01:00:00.000Z",
        source: "Salary",
        type: "income"
      })
    ],
    "income",
    juneMidpoint
  );

  assertEqual(rows.length, 3, "breakdown should include three June income accounts");
  assertEqual(rows[0]?.label, "BRI", "largest account should be first");
  assertEqual(rows[0]?.amount, 8_000_000, "BRI amount should be grouped");
  assertEqual(rows[0]?.share, 8_000_000 / 11_000_000, "BRI share should reflect grouped total");
  assertEqual(rows[1]?.label, "Jago", "second account should be Jago");
  assertEqual(rows[2]?.label, "Unassigned", "missing account label should bucket as unassigned");
  assertEqual(rows[2]?.amount, 1_000_000, "unassigned income amount");
});

test("getEffectiveBalance returns tracked opening balance only", () => {
  const balance = getEffectiveBalance({
    accounts: [hubAccount(1_500_000)],
    moments: [],
    transfers: [],
    referenceDate: juneMidpoint
  });

  assertEqual(balance, 1_500_000, "opening balance only");
});

test("getEffectiveBalance adds income moments on tracked accounts", () => {
  const balance = getEffectiveBalance({
    accounts: [hubAccount(1_000_000)],
    moments: [
      moment({
        amount: 200_000,
        accountLabel: "BRI",
        occurredAt: "2026-06-12T12:00:00.000Z",
        source: "Bonus",
        type: "income"
      })
    ],
    transfers: [],
    referenceDate: juneMidpoint
  });

  assertEqual(balance, 1_200_000, "income should increase tracked total");
});

test("getEffectiveBalance subtracts non-Bills expenses from tracked total", () => {
  const balance = getEffectiveBalance({
    accounts: [hubAccount(1_000_000)],
    moments: [
      moment({
        amount: 150_000,
        accountLabel: "BRI",
        context: "Meal",
        occurredAt: "2026-06-12T12:00:00.000Z"
      })
    ],
    transfers: [],
    referenceDate: juneMidpoint
  });

  assertEqual(balance, 850_000, "normal expense should reduce effective balance");
});

test("getEffectiveBalance ignores Bills-context expenses covered by the reserve", () => {
  const accounts = [hubAccount(1_000_000)];
  const withBillsExpense = getEffectiveBalance({
    accounts,
    moments: [
      moment({
        amount: 200_000,
        accountLabel: "BRI",
        context: "Bills",
        occurredAt: "2026-06-12T12:00:00.000Z"
      })
    ],
    transfers: [],
    referenceDate: juneMidpoint
  });
  const withMealExpense = getEffectiveBalance({
    accounts,
    moments: [
      moment({
        amount: 200_000,
        accountLabel: "BRI",
        context: "Meal",
        occurredAt: "2026-06-12T12:00:00.000Z"
      })
    ],
    transfers: [],
    referenceDate: juneMidpoint
  });

  assertEqual(withBillsExpense, 1_000_000, "Bills expense should not reduce effective balance");
  assertEqual(withMealExpense, 800_000, "normal expense should reduce effective balance");
});

test("getEffectiveBalance ignores future-dated moments", () => {
  const balance = getEffectiveBalance({
    accounts: [hubAccount(1_000_000)],
    moments: [
      moment({
        amount: 500_000,
        accountLabel: "BRI",
        occurredAt: "2026-06-20T12:00:00.000Z",
        source: "Bonus",
        type: "income"
      })
    ],
    transfers: [],
    referenceDate: juneMidpoint
  });

  assertEqual(balance, 1_000_000, "future moment should be ignored");
});

test("getEffectiveBalance excludes ephemeral destination from tracked total after transfer", () => {
  const balance = getEffectiveBalance({
    accounts: [hubAccount(1_000_000), ephemeralAccount("GoPay")],
    moments: [],
    transfers: [
      moneyTransfer({
        amount: 300_000,
        fromAccount: "BRI",
        toAccount: "GoPay",
        occurredAt: "2026-06-10T12:00:00.000Z"
      })
    ],
    referenceDate: juneMidpoint
  });

  assertEqual(balance, 700_000, "transfer to ephemeral account should lower tracked total");
});

test("buildSafeToSpend keeps safeDaily when a reserved Bills expense is logged", () => {
  const bills = [{ id: "b1", label: "Internet", amount: 200_000, active: true, createdAt: "x", updatedAt: "x" }];
  const accounts = [hubAccount(1_000_000, "2026-06-15T01:00:00.000Z")];
  const daysLeft = getDaysRemainingInMonth(juneMidpoint);

  const withoutLoggedBill = buildSafeToSpend({
    accounts,
    bills,
    moments: [],
    transfers: [],
    referenceDate: juneMidpoint
  });
  const withLoggedBill = buildSafeToSpend({
    accounts,
    bills,
    moments: [
      moment({
        amount: 200_000,
        accountLabel: "BRI",
        context: "Bills",
        occurredAt: "2026-06-15T02:00:00.000Z"
      })
    ],
    transfers: [],
    referenceDate: juneMidpoint
  });

  assertEqual(withoutLoggedBill.billsReserve, 200_000, "reserve sums active recurring bills");
  assertEqual(withLoggedBill.billsReserve, 200_000, "reserve should stay the same when a bill is logged");
  assertEqual(withLoggedBill.effectiveBalance, 1_000_000, "logged Bills expense should not touch effective balance");
  assertEqual(withLoggedBill.spendableBalance, withoutLoggedBill.spendableBalance, "Bills expense should not reduce spendable balance");
  assertEqual(withLoggedBill.safeDaily, withoutLoggedBill.safeDaily, "safeDaily should stay unchanged");
  assertEqual(withoutLoggedBill.safeDaily, Math.round(800_000 / daysLeft), "baseline safeDaily reserves bills once");
});

test("buildSafeToSpend computes safeDaily from effective balance and days left", () => {
  const daysLeft = getDaysRemainingInMonth(juneMidpoint);
  const safe = buildSafeToSpend({
    accounts: [hubAccount(1_600_000, "2026-06-15T01:00:00.000Z")],
    moments: [],
    transfers: [],
    referenceDate: juneMidpoint
  });

  assertEqual(safe.effectiveBalance, 1_600_000, "effective balance should use tracked total");
  assertEqual(safe.billsReserve, 0, "no bills means zero reserve");
  assertEqual(safe.spendableBalance, 1_600_000, "spendable equals effective when reserve is zero");
  assertEqual(safe.daysLeft, daysLeft, "days left should default to month remainder");
  assertEqual(safe.safeDaily, Math.round(1_600_000 / daysLeft), "safeDaily should divide balance by days left");
});

test("buildSafeToSpend subtracts bills reserve from safeDaily", () => {
  const daysLeft = getDaysRemainingInMonth(juneMidpoint);
  const safe = buildSafeToSpend({
    accounts: [hubAccount(1_600_000, "2026-06-15T01:00:00.000Z")],
    bills: [
      { id: "b1", label: "Rent", amount: 600_000, active: true, createdAt: "x", updatedAt: "x" },
      { id: "b2", label: "Paused", amount: 200_000, active: false, createdAt: "x", updatedAt: "x" }
    ],
    moments: [],
    transfers: [],
    referenceDate: juneMidpoint
  });

  assertEqual(safe.billsReserve, 600_000, "reserve sums active bills only");
  assertEqual(safe.spendableBalance, 1_000_000, "spendable balance excludes reserve");
  assertEqual(safe.safeDaily, Math.round(1_000_000 / daysLeft), "safeDaily uses spendable balance");
});

test("simulatePurchase respects bills reserve when judging affordability", () => {
  const safe = buildSafeToSpend({
    accounts: [hubAccount(1_000_000, "2026-06-15T01:00:00.000Z")],
    bills: [{ id: "b1", label: "Bills", amount: 400_000, active: true, createdAt: "x", updatedAt: "x" }],
    moments: trailingExpenseMoments(50_000, 10, juneMidpoint),
    transfers: [],
    referenceDate: juneMidpoint,
    windowDays: 10
  });
  const typicalNeed = safe.typicalDaily * safe.daysLeft;

  assertEqual(safe.typicalDaily, 50_000, "uniform 10-day history should median to 50k typical daily");
  assertEqual(typicalNeed, 50_000 * getDaysRemainingInMonth(juneMidpoint), "typical need scales median daily by days left");
  assertEqual(safe.spendableBalance, 600_000, "spendable balance should exclude the bills reserve");

  const purchase = simulatePurchase({ amount: 500_000, safe });
  assertEqual(purchase.remainingBalance, 100_000, "purchase should reduce spendable balance");
  assertEqual(purchase.remainingBalance < typicalNeed, true, "remaining cash should fall short of median-based typical need");
  assertEqual(purchase.coversTypicalDays, false, "affordability should use median-based typicalDaily");
  assertEqual(purchase.affordable, false, "large purchase should fail daily coverage even with non-negative balance");
});

test("buildSafeToSpend classifies spending pace against safeDaily", () => {
  const daysLeft = getDaysRemainingInMonth(juneMidpoint);
  const baseArgs = {
    accounts: [hubAccount(1_000_000, "2026-06-15T08:00:00.000Z")],
    transfers: [] as MoneyTransfer[],
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

  assertEqual(underSpend.pace, "under", "lower typical spend should pace under safeDaily");
  assertEqual(overSpend.pace, "over", "higher typical spend should pace over safeDaily");
  assertEqual(evenSpend.pace, "even", "matching typical spend should pace even");
});

test("getTypicalDailySpend uses median so one spike does not inflate typical daily", () => {
  const referenceDate = new Date("2026-06-15T08:00:00.000Z");
  const moments = [
    ...expensesOnOffsets(referenceDate, 2, 10, 50_000),
    expenseOnDay(referenceDate, 1, 2_000_000)
  ];

  const typical = getTypicalDailySpend(moments, referenceDate);

  assertEqual(typical.amount, 50_000, "median path should ignore the one-day spike");
  assertEqual(typical.amount !== 245_000, true, "typical daily should not follow the inflated mean");
});

test("getTypicalDailySpend divides short history by elapsed days not the full window", () => {
  const referenceDate = new Date("2026-06-15T08:00:00.000Z");
  const typical = getTypicalDailySpend(expensesOnOffsets(referenceDate, 1, 5, 100_000), referenceDate);

  assertEqual(typical.amount, 100_000, "five-day history should use five elapsed days");
  assertEqual(typical.amount !== Math.round(500_000 / 30), true, "typical daily should not divide by 30");
});

test("getTypicalDailySpend falls back to elapsed-day mean when most days are zero", () => {
  const referenceDate = new Date("2026-06-15T08:00:00.000Z");
  const moments = [
    expenseOnDay(referenceDate, 10, 100_000),
    expenseOnDay(referenceDate, 9, 100_000),
    expenseOnDay(referenceDate, 8, 100_000)
  ];

  const typical = getTypicalDailySpend(moments, referenceDate);

  assertEqual(typical.amount, 30_000, "sparse history should use elapsed-day mean");
});

test("getTypicalDailySpend confidence requires elapsed days and distinct expense days", () => {
  const referenceDate = new Date("2026-06-15T08:00:00.000Z");

  const confident = getTypicalDailySpend(expensesOnOffsets(referenceDate, 1, 14, 40_000), referenceDate);
  const shortElapsed = getTypicalDailySpend(expensesOnOffsets(referenceDate, 1, 13, 40_000), referenceDate);
  const sparseDistinct = getTypicalDailySpend(
    [4, 6, 8, 10, 12, 14].map((offset) => expenseOnDay(referenceDate, offset, 40_000)),
    referenceDate
  );

  assertEqual(confident.confident, true, "14 elapsed days and 14 distinct days should be confident");
  assertEqual(shortElapsed.confident, false, "fewer than 14 elapsed days should stay uncertain");
  assertEqual(sparseDistinct.confident, false, "fewer than 7 distinct expense days should stay uncertain");
});

test("simulatePurchase rejects purchases that break daily coverage even when balance remains", () => {
  const safe = buildSafeToSpend({
    accounts: [hubAccount(1_000_000, "2026-06-15T01:00:00.000Z")],
    moments: trailingExpenseMoments(50_000, 10, juneMidpoint),
    transfers: [],
    referenceDate: juneMidpoint,
    windowDays: 10
  });
  const typicalNeed = safe.typicalDaily * safe.daysLeft;

  assertEqual(safe.typicalDaily, 50_000, "uniform 10-day history should median to 50k typical daily");
  assertEqual(typicalNeed, 800_000, "median-based typical need should be 50k times days left in month");

  const tightPurchase = simulatePurchase({ amount: 300_000, safe });
  const comfortablePurchase = simulatePurchase({ amount: 100_000, safe });

  assertEqual(tightPurchase.remainingBalance, 700_000, "purchase should reduce remaining balance");
  assertEqual(tightPurchase.remainingBalance >= 0, true, "purchase should still leave non-negative balance");
  assertEqual(tightPurchase.remainingBalance < typicalNeed, true, "remaining cash should fall short of median-based typical need");
  assertEqual(tightPurchase.coversTypicalDays, false, "remaining cash should not cover median-based typical need");
  assertEqual(tightPurchase.affordable, false, "affordable requires balance and median-based daily coverage");
  assertEqual(comfortablePurchase.remainingBalance, 900_000, "smaller purchase should leave more headroom");
  assertEqual(comfortablePurchase.coversTypicalDays, true, "remaining cash should cover median-based typical need");
  assertEqual(comfortablePurchase.affordable, true, "smaller purchase should stay affordable");
  assertEqual(
    comfortablePurchase.newSafeDaily,
    Math.max(0, Math.round(900_000 / safe.daysLeft)),
    "newSafeDaily should recompute from remaining balance"
  );
  assertEqual(comfortablePurchase.insight, "comfortable", "comfortable purchase should leave headroom above typical daily");
});

test("simulatePurchase surfaces tight and below-daily insights from typical pace", () => {
  const safe = buildSafeToSpend({
    accounts: [hubAccount(1_000_000, "2026-06-15T01:00:00.000Z")],
    moments: trailingExpenseMoments(50_000, 10, juneMidpoint),
    transfers: [],
    referenceDate: juneMidpoint,
    windowDays: 10
  });

  const oneDayLeft = simulatePurchase({ amount: 950_000, safe });
  const belowDaily = simulatePurchase({ amount: 980_000, safe });
  const multiDayTight = simulatePurchase({ amount: 300_000, safe });

  assertEqual(oneDayLeft.insight, "tight_one_day", "one day of typical pace should warn about tomorrow");
  assertEqual(oneDayLeft.daysAtTypicalPace, 1, "one day of typical pace");
  assertEqual(belowDaily.insight, "below_daily_need", "remaining below one typical day should fail daily-life fit");
  assertEqual(belowDaily.daysAtTypicalPace, 0, "below one typical day");
  assertEqual(multiDayTight.insight, "tight_multi_day", "partial typical coverage should warn about horizon");
  assertEqual(multiDayTight.daysAtTypicalPace >= 2, true, "multi-day tight should cover at least two typical days");
});

test("simulatePurchase falls back to safe daily when spending history is sparse", () => {
  const safe = buildSafeToSpend({
    accounts: [hubAccount(1_000_000, "2026-06-15T01:00:00.000Z")],
    moments: [],
    transfers: [],
    referenceDate: juneMidpoint
  });

  assertEqual(safe.confident, false, "empty history should not be confident");
  assertEqual(safe.typicalDaily, 0, "empty history should have zero typical daily");

  const purchase = simulatePurchase({ amount: 900_000, safe });

  assertEqual(purchase.usesHistoryReference, false, "should use safe daily fallback");
  assertEqual(purchase.referenceDaily, safe.safeDaily, "reference daily should match safe daily");

  const sparse = buildSafeToSpend({
    accounts: [hubAccount(1_000_000, "2026-06-15T01:00:00.000Z")],
    moments: trailingExpenseMoments(50_000, 10, juneMidpoint),
    transfers: [],
    referenceDate: juneMidpoint,
    windowDays: 10
  });
  const sparsePurchase = simulatePurchase({ amount: 950_000, safe: sparse });

  assertEqual(sparse.confident, false, "short history should stay uncertain");
  assertEqual(sparsePurchase.usesHistoryReference, true, "should still use typical daily when available");
  assertEqual(sparsePurchase.referenceDaily, sparse.typicalDaily, "reference daily should use typical spend");
  assertEqual(sparsePurchase.insight, "tight_one_day", "typical pace should warn about tomorrow");
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

function hubAccount(openingBalance: number, openingSetAt = defaultOpeningSetAt): MoneyAccount {
  return {
    createdAt: defaultOpeningSetAt,
    id: "hub-bri",
    isIncomeHub: true,
    kind: "bank",
    label: "BRI",
    openingBalance,
    openingSetAt,
    tier: "tracked",
    updatedAt: defaultOpeningSetAt
  };
}

function ephemeralAccount(label: string): MoneyAccount {
  return {
    createdAt: defaultOpeningSetAt,
    id: `account-${label}`,
    isIncomeHub: false,
    kind: "wallet",
    label,
    openingBalance: 0,
    openingSetAt: defaultOpeningSetAt,
    tier: "ephemeral",
    updatedAt: defaultOpeningSetAt
  };
}

function moneyTransfer(input: {
  amount: number;
  fromAccount: string;
  occurredAt: string;
  toAccount: string;
}): MoneyTransfer {
  return {
    amount: input.amount,
    createdAt: input.occurredAt,
    fromAccount: input.fromAccount,
    id: `transfer-${input.occurredAt}-${input.amount}`,
    occurredAt: input.occurredAt,
    toAccount: input.toAccount,
    updatedAt: input.occurredAt
  };
}

function expenseOnDay(referenceDate: Date, daysBeforeEnd: number, amount: number): SpendingMoment {
  const windowEnd = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
  const day = new Date(windowEnd);
  day.setDate(day.getDate() - daysBeforeEnd);
  return moment({
    amount,
    context: "Meal",
    occurredAt: day.toISOString()
  });
}

function expensesOnOffsets(
  referenceDate: Date,
  startOffset: number,
  endOffset: number,
  amount: number
): SpendingMoment[] {
  const moments: SpendingMoment[] = [];
  for (let offset = startOffset; offset <= endOffset; offset += 1) {
    moments.push(expenseOnDay(referenceDate, offset, amount));
  }
  return moments;
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