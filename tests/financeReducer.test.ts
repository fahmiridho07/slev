import { EntryType, SpendingContext, SpendingMoment } from "../src/features/spendingMemory.types";
import { financeReducer, FinanceState, initialFinanceState } from "../src/state/financeReducer";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void;
};

const tests: TestCase[] = [];

test("set_message updates only the message field", () => {
  const next = financeReducer(initialFinanceState, {
    type: "set_message",
    message: "Saved."
  });

  assertEqual(next.message, "Saved.", "message updated");
  assertEqual(next.moments, initialFinanceState.moments, "moments unchanged");
  assertEqual(next.isReady, initialFinanceState.isReady, "isReady unchanged");
});

test("set_clear_confirm_visible toggles dialog visibility", () => {
  const open = financeReducer(initialFinanceState, {
    type: "set_clear_confirm_visible",
    visible: true
  });
  const closed = financeReducer(open, {
    type: "set_clear_confirm_visible",
    visible: false
  });

  assertEqual(open.clearConfirmVisible, true, "dialog opens");
  assertEqual(closed.clearConfirmVisible, false, "dialog closes");
});

test("prepend_moment adds to the front without replacing other moments", () => {
  const existing = buildMoment({ amount: 10000, occurredAt: "2026-06-01T01:00:00.000Z" });
  const saved = buildMoment({ amount: 20000, occurredAt: "2026-06-02T01:00:00.000Z", id: "new-moment" });
  const state: FinanceState = { ...initialFinanceState, moments: [existing] };
  const next = financeReducer(state, { type: "prepend_moment", moment: saved });

  assertEqual(next.moments.length, 2, "moment count");
  assertEqual(next.moments[0]?.id, "new-moment", "new moment first");
  assertEqual(next.moments[1]?.id, existing.id, "existing moment preserved");
});

test("replace_moment updates one row and keeps references for others", () => {
  const first = buildMoment({ amount: 10000, occurredAt: "2026-06-01T01:00:00.000Z", id: "first" });
  const second = buildMoment({ amount: 20000, occurredAt: "2026-06-02T01:00:00.000Z", id: "second" });
  const state: FinanceState = { ...initialFinanceState, moments: [first, second] };
  const updated = { ...second, amount: 25000 };
  const next = financeReducer(state, { type: "replace_moment", moment: updated });

  assertEqual(next.moments[0], first, "untouched moment keeps reference");
  assertEqual(next.moments[1]?.amount, 25000, "target moment updated");
});

test("remove_moment filters by id", () => {
  const first = buildMoment({ amount: 10000, occurredAt: "2026-06-01T01:00:00.000Z", id: "keep" });
  const second = buildMoment({ amount: 20000, occurredAt: "2026-06-02T01:00:00.000Z", id: "drop" });
  const state: FinanceState = { ...initialFinanceState, moments: [first, second] };
  const next = financeReducer(state, { type: "remove_moment", id: "drop" });

  assertEqual(next.moments.length, 1, "one moment remains");
  assertEqual(next.moments[0]?.id, "keep", "remaining moment");
});

test("hydrate merges stored collections without touching ui flags", () => {
  const moment = buildMoment({ amount: 10000, occurredAt: "2026-06-01T01:00:00.000Z" });
  const next = financeReducer(
    { ...initialFinanceState, isReady: true, message: "Ready", clearConfirmVisible: true },
    {
      type: "hydrate",
      payload: {
        moments: [moment],
        feedback: [],
        budgetLimits: [],
        categoryModes: [],
        manualTemplates: [],
        recurringBills: [],
        savingsGoals: [],
        balanceAnchor: null,
        accounts: [],
        transfers: [],
        expenseCategories: []
      }
    }
  );

  assertEqual(next.moments.length, 1, "moments hydrated");
  assertEqual(next.isReady, true, "isReady preserved");
  assertEqual(next.message, "Ready", "message preserved");
  assertEqual(next.clearConfirmVisible, true, "dialog state preserved");
});

test("set_undo_toast stores and clears deleted moment snapshot", () => {
  const moment = buildMoment({ amount: 12000, occurredAt: "2026-06-01T01:00:00.000Z" });
  const withUndo = financeReducer(initialFinanceState, { type: "set_undo_toast", moment });
  assertEqual(withUndo.undoToast?.id, moment.id, "undo snapshot stored");

  const cleared = financeReducer(withUndo, { type: "set_undo_toast", moment: null });
  assertEqual(cleared.undoToast, null, "undo snapshot cleared");
});

test("set_budget_limits replaces limits array", () => {
  const limits = [{ category: "Meal" as const, createdAt: "x", id: "l1", limitAmount: 500000, period: "monthly" as const, updatedAt: "x" }];
  const next = financeReducer(initialFinanceState, { type: "set_budget_limits", budgetLimits: limits });
  assertEqual(next.budgetLimits, limits, "limits replaced");
});

test("clear_all resets finance memory but keeps default accounts and categories", () => {
  const state: FinanceState = {
    ...initialFinanceState,
    balanceAnchor: { amount: 500_000, setAt: "2026-06-10T00:00:00.000Z" },
    clearConfirmVisible: true,
    feedback: [{ patternId: "p1", response: "keep", createdAt: "2026-06-01T00:00:00.000Z" }],
    moments: [buildMoment({ amount: 10000, occurredAt: "2026-06-01T01:00:00.000Z" })],
    message: "Busy"
  };
  const resetAccounts = [{ createdAt: "x", id: "a1", isIncomeHub: true, kind: "bank" as const, label: "BRI", updatedAt: "x" }];
  const resetCategories = [{ createdAt: "x", id: "c1", isDefault: true, label: "Meal", updatedAt: "x" }];
  const next = financeReducer(state, {
    type: "clear_all",
    payload: { accounts: resetAccounts, expenseCategories: resetCategories }
  });

  assertEqual(next.balanceAnchor, null, "balance anchor cleared");
  assertEqual(next.moments.length, 0, "moments cleared");
  assertEqual(next.feedback.length, 0, "feedback cleared");
  assertEqual(next.clearConfirmVisible, false, "dialog closed");
  assertEqual(next.accounts, resetAccounts, "default accounts restored");
  assertEqual(next.expenseCategories, resetCategories, "default categories restored");
  assertEqual(next.message, "Busy", "message preserved");
});

test("clear_all clears undo toast snapshot", () => {
  const moment = buildMoment({ amount: 12000, occurredAt: "2026-06-01T01:00:00.000Z" });
  const state: FinanceState = {
    ...initialFinanceState,
    undoToast: moment
  };
  const next = financeReducer(state, {
    type: "clear_all",
    payload: { accounts: [], expenseCategories: [] }
  });

  assertEqual(next.undoToast, null, "undo toast cleared");
});

for (const testCase of tests) {
  try {
    testCase.run();
    console.log(`ok - ${testCase.name}`);
  } catch (error) {
    console.error(`not ok - ${testCase.name}`);
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

if (process.exitCode) {
  console.error("finance reducer tests failed.");
} else {
  console.log(`${tests.length} finance reducer tests passed.`);
}

function test(name: string, run: () => void): void {
  tests.push({ name, run });
}

function assertEqual(actual: unknown, expected: unknown, message: string): void {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${printable(expected)}, got ${printable(actual)}.`);
  }
}

function buildMoment(input: {
  amount: number;
  context?: SpendingContext;
  id?: string;
  occurredAt: string;
  type?: EntryType;
}): SpendingMoment {
  const id = input.id ?? `moment-${input.occurredAt}-${input.amount}`;
  return {
    amount: input.amount,
    context: input.context ?? "Other",
    createdAt: input.occurredAt,
    id,
    label: undefined,
    note: undefined,
    occurredAt: input.occurredAt,
    source: undefined,
    type: input.type ?? "expense",
    updatedAt: input.occurredAt
  };
}

function printable(value: unknown): string {
  return typeof value === "string" ? `"${value}"` : JSON.stringify(value);
}