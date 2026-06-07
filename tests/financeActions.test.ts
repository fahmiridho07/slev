import { saveSpendingMoment } from "../src/services/spendingMemoryRepository";
import { exportAllData } from "../src/services/storageBackup";
import { resetStorageDriver, setStorageDriver, StorageDriver } from "../src/services/storage";
import { createFinanceActions } from "../src/state/financeActions";
import { financeReducer, FinanceState, initialFinanceState } from "../src/state/financeReducer";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void | Promise<void>;
};

const tests: TestCase[] = [];

function test(name: string, run: () => void | Promise<void>): void {
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

function createTestHarness(seed?: Partial<FinanceState>) {
  let state: FinanceState = { ...initialFinanceState, isReady: true, ...seed };
  const dispatch = (action: Parameters<typeof financeReducer>[1]) => {
    state = financeReducer(state, action);
  };
  const actions = createFinanceActions(dispatch, () => state);
  return {
    actions,
    dispatch,
    getState: () => state
  };
}

test("savePlan returns validation error when expected income is missing", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions } = createTestHarness();

  const result = await actions.savePlan({
    expectedIncome: "",
    fixedCosts: "",
    flexibleBudget: "0",
    note: "",
    savingsTarget: ""
  });

  assertEqual(result.ok, false, "save rejected");
  if (!result.ok) {
    assertEqual(result.validation?.field, "expectedIncome", "income field flagged");
  }
  assertEqual(driver.store.has("slev_monthly_plans"), false, "no plan persisted");
});

test("savePlan persists plan and updates reducer state", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions, getState } = createTestHarness();

  const result = await actions.savePlan({
    expectedIncome: "5000000",
    fixedCosts: "2000000",
    flexibleBudget: "2000000",
    note: "June plan",
    savingsTarget: "1000000"
  });

  assertEqual(result.ok, true, "save succeeds");
  assertEqual(getState().monthlyPlan?.expectedIncome, 5000000, "state updated");
  assertEqual(getState().monthlyPlan?.note, "June plan", "note stored");
});

test("saveGoal returns validation error when fields are missing", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions } = createTestHarness();

  const result = await actions.saveGoal({
    label: "",
    savedAmount: "",
    targetAmount: "100000"
  });

  assertEqual(result.ok, false, "goal save rejected");
  if (!result.ok) {
    assertEqual(result.validation?.field, "label", "label field flagged");
  }
});

test("saveGoal persists goal and updates reducer state", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions, getState } = createTestHarness();

  const result = await actions.saveGoal({
    label: "Emergency",
    savedAmount: "500000",
    targetAmount: "10000000"
  });

  assertEqual(result.ok, true, "goal save succeeds");
  assertEqual(getState().savingsGoals.length, 1, "one goal in state");
  assertEqual(getState().savingsGoals[0]?.label, "Emergency", "goal label stored");
});

test("importLocalBackup rejects invalid JSON", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions } = createTestHarness();

  const result = await actions.importLocalBackup("{not-json");

  assertEqual(result.ok, false, "import rejected");
  if (!result.ok) {
    assertEqual(result.validation?.field, "importJson", "import field flagged");
  }
});

test("importLocalBackup clears undo toast after successful import", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await saveSpendingMoment({
    amount: 12000,
    label: "Snack",
    context: "Food",
    type: "expense"
  });
  const backup = await exportAllData();
  const deletedMoment = {
    id: "deleted-1",
    amount: 9000,
    label: "Coffee",
    context: "Food",
    type: "expense" as const,
    occurredAt: "2026-06-01T08:00:00.000Z",
    recordedAt: "2026-06-01T08:00:00.000Z",
    createdAt: "2026-06-01T08:00:00.000Z",
    updatedAt: "2026-06-01T08:00:00.000Z"
  };
  const { actions, getState } = createTestHarness({ undoToast: deletedMoment });

  const result = await actions.importLocalBackup(JSON.stringify(backup));
  assertEqual(result.ok, true, "import succeeds");
  assertEqual(getState().undoToast, null, "undo toast cleared");
});

test("confirmClearAll clears undo toast in reducer state", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await saveSpendingMoment({
    amount: 15000,
    label: "Lunch",
    context: "Food",
    type: "expense"
  });

  const deletedMoment = {
    id: "deleted-2",
    amount: 15000,
    label: "Lunch",
    context: "Food",
    type: "expense" as const,
    occurredAt: "2026-06-01T12:00:00.000Z",
    recordedAt: "2026-06-01T12:00:00.000Z",
    createdAt: "2026-06-01T12:00:00.000Z",
    updatedAt: "2026-06-01T12:00:00.000Z"
  };
  const { actions, getState } = createTestHarness({
    moments: [deletedMoment],
    undoToast: deletedMoment
  });

  await actions.confirmClearAll();

  assertEqual(getState().undoToast, null, "undo toast cleared");
  assertEqual(getState().moments.length, 0, "moments cleared");
});

async function runTests(): Promise<void> {
  for (const { name, run } of tests) {
    try {
      await run();
      console.log(`ok - ${name}`);
    } catch (error) {
      process.exitCode = 1;
      const message = error instanceof Error ? error.message : String(error);
      console.error(`not ok - ${name}`);
      console.error(`  ${message}`);
    } finally {
      resetStorageDriver();
    }
  }

  if (process.exitCode) {
    console.error("financeActions tests failed.");
  } else {
    console.log(`${tests.length} financeActions tests passed.`);
  }
}

void runTests();

type MemoryDriver = StorageDriver & {
  store: Map<string, string>;
};

function createMemoryDriver(options?: { failWrites?: Set<string> }): MemoryDriver {
  const store = new Map<string, string>();

  return {
    store,
    async getItem(key) {
      return store.get(key) ?? null;
    },
    async setItem(key, value) {
      if (options?.failWrites?.has(key)) {
        throw new Error(`write blocked for ${key}`);
      }
      store.set(key, value);
    },
    async removeItem(key) {
      store.delete(key);
    },
    async multiRemove(keys) {
      keys.forEach((key) => store.delete(key));
    },
    async getAllKeys() {
      return [...store.keys()];
    }
  };
}