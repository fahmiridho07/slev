import { saveSpendingMoment } from "../src/services/spendingMemoryRepository";
import { exportAllData } from "../src/services/storageBackup";
import { resetStorageDriver, setStorageDriver, StorageDriver } from "../src/services/storage";
import { STORAGE_KEYS } from "../src/services/storageSchema";
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

test("saveCategory rejects duplicate default labels", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions } = createTestHarness({ isReady: true });

  const result = await actions.saveCategory({ label: "Food" });

  assertEqual(result.ok, false, "duplicate category rejected");
  if (!result.ok) {
    assertEqual(result.validation?.field, "label", "label field flagged");
  }
});

test("saveAccount rejects duplicate default labels", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions } = createTestHarness({ isReady: true });

  const result = await actions.saveAccount({
    label: "BRI",
    kind: "bank",
    isIncomeHub: false
  });

  assertEqual(result.ok, false, "duplicate account rejected");
  if (!result.ok) {
    assertEqual(result.validation?.field, "label", "label field flagged");
  }
});

test("saveMoment persists expense and prepends to state", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions, getState } = createTestHarness({
    isReady: true,
    accounts: [
      {
        id: "acct-bri",
        label: "BRI",
        kind: "bank",
        isIncomeHub: true,
        tier: "tracked",
        openingBalance: 0,
        openingSetAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    ]
  });

  const result = await actions.saveMoment(
    {
      entryType: "expense",
      amountText: "25000",
      label: "Snack",
      context: "Food",
      accountLabel: "BRI",
      note: "",
      occurredAtKey: null,
      fromAccount: "BRI",
      toAccount: "Jago",
      source: ""
    },
    8
  );

  assertEqual(result.ok, true, "capture saved");
  assertEqual(getState().moments.length, 1, "moment prepended");
  assertEqual(getState().moments[0]?.amount, 25000, "amount stored");
});

test("saveMoment persists backdated occurredAt", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions, getState } = createTestHarness({
    isReady: true,
    accounts: [
      {
        id: "acct-bri",
        label: "BRI",
        kind: "bank",
        isIncomeHub: true,
        tier: "tracked",
        openingBalance: 0,
        openingSetAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    ]
  });

  const result = await actions.saveMoment(
    {
      entryType: "expense",
      amountText: "12000",
      label: "Snack",
      context: "Food",
      accountLabel: "BRI",
      note: "",
      occurredAtKey: "2026-06-07",
      fromAccount: "BRI",
      toAccount: "Jago",
      source: ""
    },
    8
  );

  assertEqual(result.ok, true, "backdated capture saved");
  const occurredAt = getState().moments[0]?.occurredAt ?? "";
  if (!occurredAt.startsWith("2026-06-07")) {
    throw new Error(`expected backdated occurredAt, got ${occurredAt}`);
  }
});

test("saveMoment persists transfer and updates transfers state", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions, getState } = createTestHarness({
    isReady: true,
    accounts: [
      {
        id: "acct-bri",
        label: "BRI",
        kind: "bank",
        isIncomeHub: true,
        tier: "tracked",
        openingBalance: 0,
        openingSetAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      },
      {
        id: "acct-jago",
        label: "Jago",
        kind: "bank",
        isIncomeHub: false,
        tier: "tracked",
        openingBalance: 0,
        openingSetAt: "2026-01-01T00:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    ]
  });

  const result = await actions.saveMoment(
    {
      entryType: "transfer",
      amountText: "100000",
      label: "",
      context: "",
      accountLabel: "BRI",
      note: "Top up",
      occurredAtKey: null,
      fromAccount: "BRI",
      toAccount: "Jago",
      source: ""
    },
    0
  );

  assertEqual(result.ok, true, "transfer saved");
  assertEqual(getState().moments.length, 0, "transfer does not create a moment");
  assertEqual(getState().transfers.length, 1, "transfer prepended");
  assertEqual(getState().transfers[0]?.amount, 100000, "transfer amount stored");
  assertEqual(getState().transfers[0]?.fromAccount, "BRI", "from account stored");
  assertEqual(getState().transfers[0]?.toAccount, "Jago", "to account stored");
});

test("boot sets boot error and still marks ready when migration fails", async () => {
  const driver = createMemoryDriver({ failWrites: new Set([STORAGE_KEYS.moments]) });
  setStorageDriver(driver);

  await driver.setItem(
    STORAGE_KEYS.legacyTransactions,
    JSON.stringify([
      {
        id: "tx-boot-fail",
        amount: 12000,
        merchant: "Legacy",
        category: "Food",
        status: "confirmed",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    ])
  );

  const { actions, getState } = createTestHarness({ isReady: false });

  await actions.boot();

  assertEqual(getState().isReady, true, "boot finishes ready state");
  assertEqual(getState().bootError !== null, true, "boot error recorded");
});

test("removeCategory deletes the expense category", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const { actions, getState } = createTestHarness({ isReady: true });

  const saved = await actions.saveCategory({
    hint: "Netflix, Spotify, apps",
    label: "Streaming"
  });
  assertEqual(saved.ok, true, "category saved");
  const category = getState().expenseCategories.find((item) => item.label === "Streaming");
  if (!category) {
    throw new Error("expected saved category");
  }
  assertEqual(category.hint, "Netflix, Spotify, apps", "category hint stored");

  await actions.removeCategory(category);

  assertEqual(
    getState().expenseCategories.some((item) => item.label.toLowerCase() === "streaming"),
    false,
    "category removed"
  );
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