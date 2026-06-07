import {
  AccountReconciliationRow,
  buildAccountDriftAlerts,
  buildAccountReconciliation,
  buildAllocationPlan,
  buildCurrentMonthSummary,
  buildMonthlyBreakdown,
  getLatestBalanceTotal,
  getLatestBalanceSnapshots,
  getModeByCategory,
  getProjectedBalanceSnapshots,
  summarizeBalanceByTier
} from "../src/lib/financeEngine";
import {
  AccountTier,
  BalanceSnapshot,
  EntryType,
  MoneyAccount,
  MoneyTransfer,
  MonthlyPlan,
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

test("summarizes current month with default and custom category modes", () => {
  const summary = buildCurrentMonthSummary(
    [
      moment({ amount: 10_000_000, occurredAt: "2026-06-02T01:00:00.000Z", source: "Salary", type: "income" }),
      moment({ amount: 1_500_000, context: "Bills", label: "Rent", occurredAt: "2026-06-03T01:00:00.000Z" }),
      moment({ amount: 300_000, context: "Meal", occurredAt: "2026-06-04T01:00:00.000Z" }),
      moment({ amount: 200_000, context: "Transport", occurredAt: "2026-06-05T01:00:00.000Z" }),
      moment({ amount: 999_000, context: "Meal", occurredAt: "2026-05-20T01:00:00.000Z" })
    ],
    [{ category: "Transport", mode: "fixed" }],
    juneMidpoint
  );

  assertEqual(summary.income, 10_000_000, "income should include only June income");
  assertEqual(summary.fixedExpense, 1_700_000, "fixed expense should include Bills and custom-fixed Transport");
  assertEqual(summary.flexibleExpense, 300_000, "flexible expense should include Meal");
  assertEqual(summary.expense, 2_000_000, "expense should total fixed and flexible spending");
  assertEqual(summary.net, 8_000_000, "net should subtract spending from income");
  assertEqual(summary.topCategories[0]?.label, "Bills", "top category should be Bills");
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

test("allocation identifies pocket top-up need from income hub", () => {
  const allocation = buildAllocationPlan({
    accounts: [
      account("BRI", "bank", true),
      account("Jago", "bank", false)
    ],
    latestSnapshots: [
      snapshot("BRI", 3_000_000, "2026-06-15T01:00:00.000Z"),
      snapshot("Jago", 700_000, "2026-06-15T01:00:00.000Z")
    ],
    monthlyPlan: plan({
      expectedIncome: 10_000_000,
      fixedCosts: 2_000_000,
      flexibleBudget: 2_000_000,
      savingsTarget: 3_000_000
    }),
    monthlySummary: {
      expense: 2_000_000,
      fixedExpense: 1_700_000,
      flexibleExpense: 300_000,
      income: 10_000_000,
      net: 8_000_000,
      topCategories: []
    },
    today: juneMidpoint
  });

  assertEqual(allocation.flexibleRemaining, 1_700_000, "flexible remaining should subtract flexible spending");
  assertEqual(allocation.dailyFlexibleRoom, 106_250, "daily room should divide remaining flexible by days left in June");
  assertEqual(allocation.pocketTopUpNeed, 1_000_000, "pocket top-up should compare pocket balance to remaining flexible budget");
  assertEqual(allocation.nextAction.kind, "top_up_pockets", "next action should recommend funding pockets");
});

test("allocation asks for a plan before giving budget guidance", () => {
  const allocation = buildAllocationPlan({
    accounts: [],
    latestSnapshots: [],
    monthlyPlan: null,
    monthlySummary: {
      expense: 0,
      fixedExpense: 0,
      flexibleExpense: 0,
      income: 0,
      net: 0,
      topCategories: []
    },
    today: juneMidpoint
  });

  assertEqual(allocation.nextAction.kind, "set_plan", "missing plan should be the first action");
  assertEqual(allocation.dailyFlexibleRoom, 0, "daily room should stay zero without a plan");
});

test("reconciliation matches logged movements between two snapshots", () => {
  const rows = buildAccountReconciliation({
    accounts: [
      account("BRI", "bank", true),
      account("Jago", "bank", false),
      account("Cash", "cash", false)
    ],
    balanceSnapshots: [
      snapshot("BRI", 5_000_000, "2026-06-01T00:00:00.000Z"),
      snapshot("BRI", 5_750_000, "2026-06-10T00:00:00.000Z"),
      snapshot("Jago", 100_000, "2026-06-01T00:00:00.000Z"),
      snapshot("Jago", 850_000, "2026-06-10T00:00:00.000Z"),
      snapshot("Cash", 200_000, "2026-06-10T00:00:00.000Z")
    ],
    moments: [
      moment({ accountLabel: "BRI", amount: 2_000_000, occurredAt: "2026-06-02T00:00:00.000Z", type: "income" }),
      moment({ accountLabel: "BRI", amount: 500_000, occurredAt: "2026-06-04T00:00:00.000Z" })
    ],
    transfers: [
      transfer("BRI", "Jago", 750_000, "2026-06-05T00:00:00.000Z")
    ]
  });
  const bri = findReconciliation(rows, "BRI");
  const jago = findReconciliation(rows, "Jago");
  const cash = findReconciliation(rows, "Cash");

  assertEqual(bri.status, "matched", "BRI should match logged income, spending, and transfer out");
  assertEqual(bri.expectedAmount, 5_750_000, "BRI expected amount should use previous balance plus logged delta");
  assertEqual(jago.status, "matched", "Jago should match transfer in");
  assertEqual(jago.transferIn, 750_000, "Jago transfer in should be counted");
  assertEqual(cash.status, "needs_history", "Cash should need another snapshot");
});

test("buildAccountDriftAlerts surfaces needs_review drift with signed difference", () => {
  const alerts = buildAccountDriftAlerts({
    accounts: [account("BRI", "bank", true)],
    balanceSnapshots: [
      snapshot("BRI", 5_000_000, "2026-06-01T00:00:00.000Z"),
      snapshot("BRI", 5_730_000, "2026-06-10T00:00:00.000Z")
    ],
    moments: [
      moment({ accountLabel: "BRI", amount: 2_000_000, occurredAt: "2026-06-02T00:00:00.000Z", type: "income" }),
      moment({ accountLabel: "BRI", amount: 500_000, occurredAt: "2026-06-04T00:00:00.000Z" })
    ],
    toleranceAmount: 1_000,
    transfers: [
      transfer("BRI", "Jago", 750_000, "2026-06-05T00:00:00.000Z")
    ]
  });

  assertEqual(alerts.length, 1, "one drift alert");
  assertEqual(alerts[0]?.label, "BRI", "drift label");
  assertEqual(alerts[0]?.difference, -20_000, "signed drift difference");
  assertEqual(alerts[0]?.latestSnapshotDate, "2026-06-10T00:00:00.000Z", "latest snapshot date");
});

test("buildAccountDriftAlerts stays empty when balances reconcile", () => {
  const alerts = buildAccountDriftAlerts({
    accounts: [
      account("BRI", "bank", true),
      account("Jago", "bank", false),
      account("Cash", "cash", false)
    ],
    balanceSnapshots: [
      snapshot("BRI", 5_000_000, "2026-06-01T00:00:00.000Z"),
      snapshot("BRI", 5_750_000, "2026-06-10T00:00:00.000Z"),
      snapshot("Jago", 100_000, "2026-06-01T00:00:00.000Z"),
      snapshot("Jago", 850_000, "2026-06-10T00:00:00.000Z"),
      snapshot("Cash", 200_000, "2026-06-10T00:00:00.000Z")
    ],
    moments: [
      moment({ accountLabel: "BRI", amount: 2_000_000, occurredAt: "2026-06-02T00:00:00.000Z", type: "income" }),
      moment({ accountLabel: "BRI", amount: 500_000, occurredAt: "2026-06-04T00:00:00.000Z" })
    ],
    transfers: [
      transfer("BRI", "Jago", 750_000, "2026-06-05T00:00:00.000Z")
    ]
  });

  assertEqual(alerts.length, 0, "no drift alerts when reconciliation is clean");
});

test("buildAccountDriftAlerts exempts ephemeral accounts from drift flags", () => {
  const balanceSnapshots = [
    snapshot("GoPay", 50_000, "2026-06-01T00:00:00.000Z"),
    snapshot("GoPay", 120_000, "2026-06-10T00:00:00.000Z")
  ];
  const moments = [
    moment({ accountLabel: "GoPay", amount: 25_000, occurredAt: "2026-06-04T00:00:00.000Z" })
  ];
  const fixture = {
    balanceSnapshots,
    moments,
    toleranceAmount: 1_000,
    transfers: [] as MoneyTransfer[]
  };
  const reconciliation = buildAccountReconciliation({
    ...fixture,
    accounts: [account("GoPay", "wallet", false, "ephemeral")]
  });

  assertEqual(findReconciliation(reconciliation, "GoPay").status, "needs_review", "fixture should need review");

  const ephemeralAlerts = buildAccountDriftAlerts({
    ...fixture,
    accounts: [account("GoPay", "wallet", false, "ephemeral")]
  });
  const trackedAlerts = buildAccountDriftAlerts({
    ...fixture,
    accounts: [account("GoPay", "wallet", false, "tracked")]
  });

  assertEqual(ephemeralAlerts.length, 0, "ephemeral accounts stay exempt from drift flags");
  assertEqual(trackedAlerts.length, 1, "tracked account with same drift is surfaced");
  assertEqual(trackedAlerts[0]?.label, "GoPay", "tracked drift label");
});

test("buildAccountDriftAlerts still surfaces unknown snapshot labels as tracked", () => {
  const alerts = buildAccountDriftAlerts({
    accounts: [account("BRI", "bank", true)],
    balanceSnapshots: [
      snapshot("Old wallet", 50_000, "2026-06-01T00:00:00.000Z"),
      snapshot("Old wallet", 200_000, "2026-06-10T00:00:00.000Z")
    ],
    moments: [
      moment({ accountLabel: "Old wallet", amount: 25_000, occurredAt: "2026-06-04T00:00:00.000Z" })
    ],
    toleranceAmount: 1_000,
    transfers: []
  });

  assertEqual(alerts.length, 1, "unknown labels without tier still surface drift");
  assertEqual(alerts[0]?.label, "Old wallet", "unknown label kept");
});

test("buildAccountDriftAlerts ignores small_gap mismatches", () => {
  const alerts = buildAccountDriftAlerts({
    accounts: [account("BRI", "bank", true)],
    balanceSnapshots: [
      snapshot("BRI", 5_000_000, "2026-06-01T00:00:00.000Z"),
      snapshot("BRI", 5_744_000, "2026-06-10T00:00:00.000Z")
    ],
    moments: [
      moment({ accountLabel: "BRI", amount: 2_000_000, occurredAt: "2026-06-02T00:00:00.000Z", type: "income" }),
      moment({ accountLabel: "BRI", amount: 500_000, occurredAt: "2026-06-04T00:00:00.000Z" })
    ],
    transfers: [
      transfer("BRI", "Jago", 750_000, "2026-06-05T00:00:00.000Z")
    ]
  });
  const rows = buildAccountReconciliation({
    accounts: [account("BRI", "bank", true)],
    balanceSnapshots: [
      snapshot("BRI", 5_000_000, "2026-06-01T00:00:00.000Z"),
      snapshot("BRI", 5_744_000, "2026-06-10T00:00:00.000Z")
    ],
    moments: [
      moment({ accountLabel: "BRI", amount: 2_000_000, occurredAt: "2026-06-02T00:00:00.000Z", type: "income" }),
      moment({ accountLabel: "BRI", amount: 500_000, occurredAt: "2026-06-04T00:00:00.000Z" })
    ],
    transfers: [
      transfer("BRI", "Jago", 750_000, "2026-06-05T00:00:00.000Z")
    ]
  });

  assertEqual(findReconciliation(rows, "BRI").status, "small_gap", "fixture should stay a small gap");
  assertEqual(alerts.length, 0, "small gaps stay hidden");
});

test("reconciliation flags material gaps for review", () => {
  const rows = buildAccountReconciliation({
    accounts: [account("BRI", "bank", true)],
    balanceSnapshots: [
      snapshot("BRI", 5_000_000, "2026-06-01T00:00:00.000Z"),
      snapshot("BRI", 5_730_000, "2026-06-10T00:00:00.000Z")
    ],
    moments: [
      moment({ accountLabel: "BRI", amount: 2_000_000, occurredAt: "2026-06-02T00:00:00.000Z", type: "income" }),
      moment({ accountLabel: "BRI", amount: 500_000, occurredAt: "2026-06-04T00:00:00.000Z" })
    ],
    toleranceAmount: 1_000,
    transfers: [
      transfer("BRI", "Jago", 750_000, "2026-06-05T00:00:00.000Z")
    ]
  });
  const bri = findReconciliation(rows, "BRI");

  assertEqual(bri.status, "needs_review", "BRI should flag a visible balance gap");
  assertEqual(bri.difference, -20_000, "difference should show actual minus expected");
});

test("latest balance snapshots keep the newest snapshot per account", () => {
  const latest = getLatestBalanceSnapshots([
    snapshot("BRI", 1_000_000, "2026-06-01T00:00:00.000Z"),
    snapshot("Jago", 300_000, "2026-06-12T00:00:00.000Z"),
    snapshot("BRI", 2_000_000, "2026-06-13T00:00:00.000Z")
  ]);

  assertEqual(latest.length, 2, "latest snapshots should include one row per account");
  assertEqual(latest[0]?.accountLabel, "BRI", "newest snapshot should be first");
  assertEqual(latest[0]?.amount, 2_000_000, "newest BRI amount should be kept");
  assertEqual(latest[1]?.accountLabel, "Jago", "Jago should be retained");
});

test("projected balances include income before any manual snapshot", () => {
  const projected = getProjectedBalanceSnapshots({
    accounts: [
      account("BRI", "bank", true),
      account("Jago", "bank", false)
    ],
    balanceSnapshots: [],
    moments: [
      moment({ accountLabel: "BRI", amount: 2_000_000, occurredAt: "2026-06-02T00:00:00.000Z", type: "income" }),
      moment({ accountLabel: "Jago", amount: 250_000, occurredAt: "2026-06-03T00:00:00.000Z" })
    ],
    referenceDate: juneMidpoint,
    transfers: [
      transfer("BRI", "Jago", 500_000, "2026-06-04T00:00:00.000Z")
    ]
  });
  const bri = projected.find((row) => row.accountLabel === "BRI");
  const jago = projected.find((row) => row.accountLabel === "Jago");

  assertEqual(bri?.amount, 1_500_000, "BRI projected balance should include income and transfer out");
  assertEqual(jago?.amount, 250_000, "Jago projected balance should include transfer in and expense");
});

test("summarizeBalanceByTier treats accounts without tier as tracked", () => {
  const snapshots = [
    snapshot("BRI", 2_000_000, "2026-06-13T00:00:00.000Z"),
    snapshot("Jago", 700_000, "2026-06-12T00:00:00.000Z")
  ];
  const summary = summarizeBalanceByTier({
    accounts: [
      account("BRI", "bank", true),
      account("Jago", "bank", false)
    ],
    snapshots
  });

  assertEqual(summary.ephemeralTotal, 0, "no ephemeral balance");
  assertEqual(summary.trackedTotal, 2_700_000, "tracked total should sum all balances");
  assertEqual(summary.total, 2_700_000, "total should match tracked sum");
  assertEqual(summary.trackedAccountCount, 2, "both accounts counted as tracked");
  assertEqual(summary.ephemeralAccountCount, 0, "no ephemeral accounts");
});

test("summarizeBalanceByTier splits mixed tracked and ephemeral balances", () => {
  const snapshots = [
    snapshot("BRI", 2_000_000, "2026-06-13T00:00:00.000Z"),
    snapshot("GoPay", 150_000, "2026-06-12T00:00:00.000Z")
  ];
  const summary = summarizeBalanceByTier({
    accounts: [
      account("BRI", "bank", true),
      account("GoPay", "wallet", false, "ephemeral")
    ],
    snapshots
  });

  assertEqual(summary.trackedTotal, 2_000_000, "tracked portion");
  assertEqual(summary.ephemeralTotal, 150_000, "ephemeral portion");
  assertEqual(summary.total, 2_150_000, "combined total");
  assertEqual(summary.trackedAccountCount, 1, "one tracked account");
  assertEqual(summary.ephemeralAccountCount, 1, "one ephemeral account");
});

test("summarizeBalanceByTier counts unknown snapshot labels as tracked", () => {
  const summary = summarizeBalanceByTier({
    accounts: [account("BRI", "bank", true)],
    snapshots: [snapshot("Old wallet", 80_000, "2026-06-10T00:00:00.000Z")]
  });

  assertEqual(summary.trackedTotal, 80_000, "unknown label defaults to tracked");
  assertEqual(summary.ephemeralTotal, 0, "no ephemeral balance");
  assertEqual(summary.trackedAccountCount, 1, "unknown label counted as tracked");
});

test("summarizeBalanceByTier total matches getLatestBalanceTotal", () => {
  const snapshots = [
    snapshot("BRI", 2_000_000, "2026-06-13T00:00:00.000Z"),
    snapshot("GoPay", 150_000, "2026-06-12T00:00:00.000Z"),
    snapshot("BRI", 1_000_000, "2026-06-01T00:00:00.000Z")
  ];
  const summary = summarizeBalanceByTier({
    accounts: [
      account("BRI", "bank", true),
      account("GoPay", "wallet", false, "ephemeral")
    ],
    snapshots
  });

  assertEqual(summary.total, getLatestBalanceTotal(snapshots), "tier total should match latest balance total");
});

test("category modes preserve fixed defaults and custom overrides", () => {
  const modes = getModeByCategory([{ category: "Meal", mode: "fixed" }]);

  assertEqual(modes.get("Bills"), "fixed", "Bills should default to fixed");
  assertEqual(modes.get("Home"), "fixed", "Home should default to fixed");
  assertEqual(modes.get("Coffee"), "flexible", "Coffee should default to flexible");
  assertEqual(modes.get("Meal"), "fixed", "custom mode should override defaults");
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

function findReconciliation(rows: AccountReconciliationRow[], label: string): AccountReconciliationRow {
  const row = rows.find((item) => item.label === label);
  if (!row) {
    throw new Error(`Missing reconciliation row for ${label}.`);
  }
  return row;
}

function account(
  label: string,
  kind: MoneyAccount["kind"],
  isIncomeHub: boolean,
  tier?: AccountTier
): MoneyAccount {
  return {
    createdAt: "2026-06-01T00:00:00.000Z",
    id: `account-${label}`,
    isIncomeHub,
    kind,
    label,
    updatedAt: "2026-06-01T00:00:00.000Z",
    ...(tier !== undefined ? { tier } : {})
  };
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

function transfer(
  fromAccount: string,
  toAccount: string,
  amount: number,
  occurredAt: string
): MoneyTransfer {
  return {
    amount,
    createdAt: occurredAt,
    fromAccount,
    id: `transfer-${fromAccount}-${toAccount}-${occurredAt}-${amount}`,
    occurredAt,
    toAccount,
    updatedAt: occurredAt
  };
}

function snapshot(
  accountLabel: string,
  amount: number,
  snapshotDate: string
): BalanceSnapshot {
  return {
    accountLabel,
    amount,
    createdAt: snapshotDate,
    id: `snapshot-${accountLabel}-${snapshotDate}-${amount}`,
    snapshotDate
  };
}

function plan(input: {
  expectedIncome: number;
  fixedCosts: number;
  flexibleBudget: number;
  savingsTarget: number;
}): MonthlyPlan {
  return {
    createdAt: "2026-06-01T00:00:00.000Z",
    expectedIncome: input.expectedIncome,
    fixedCosts: input.fixedCosts,
    flexibleBudget: input.flexibleBudget,
    id: "plan-june",
    month: "2026-06",
    savingsTarget: input.savingsTarget,
    updatedAt: "2026-06-01T00:00:00.000Z"
  };
}

function printable(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value);
}
