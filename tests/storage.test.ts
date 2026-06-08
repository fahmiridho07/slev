import {
  listMoneyAccounts,
  listMoneyTransfers,
  saveMoneyAccount,
  saveMoneyTransfer
} from "../src/services/accountRepository";
import {
  listSpendingMoments,
  runSpendingMemoryV2Migration,
  saveSpendingMoment
} from "../src/services/spendingMemoryRepository";
import { exportAllData, exportAllDataWithReport, importAllData } from "../src/services/storageBackup";
import {
  corruptBackupKeyPrefix,
  isKeyCorrupt,
  readJson,
  readRaw,
  resetStorageDriver,
  setStorageDriver,
  StorageDriver,
  writeJson,
  writeRaw
} from "../src/services/storage";
import { listCorruptStorageIssues, resetStorageKey } from "../src/services/storageHealth";
import {
  getSchemaVersion,
  runMigrations,
  STORAGE_KEYS
} from "../src/services/storageSchema";
import {
  getColorSchemePreference,
  getLocalePreference,
  getReduceMotionPreference,
  hasSeenListActionsHint,
  markListActionsHintSeen,
  setColorSchemePreference,
  setLocalePreference,
  setReduceMotionPreference
} from "../src/services/uiPreferences";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void | Promise<void>;
};

const tests: TestCase[] = [];

test("readJson and writeJson round-trip stored arrays", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  const payload = [{ id: "a1", amount: 12000 }];
  const written = await writeJson("slev_entries", payload);
  assertEqual(written, true, "write succeeds");

  const result = await readJson<typeof payload>("slev_entries");
  assertEqual(result.status, "ok", "read status");
  if (result.status === "ok") {
    assertEqual(JSON.stringify(result.value), JSON.stringify(payload), "round-trip payload");
  }
});

test("writeRaw returns false when the driver rejects writes", async () => {
  const driver = createMemoryDriver({ failWrites: new Set(["slev_accounts"]) });
  setStorageDriver(driver);

  const ok = await writeRaw("slev_accounts", "[]");
  assertEqual(ok, false, "failed write reported");
  assertEqual(driver.store.has("slev_accounts"), false, "nothing persisted");
});

test("corrupt blobs are backed up and left untouched on later writes", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await driver.setItem("slev_budget_limits", "{not-json");
  const result = await readJson("slev_budget_limits");
  assertEqual(result.status, "corrupt", "corrupt read detected");
  assertEqual(isKeyCorrupt("slev_budget_limits"), true, "corrupt flag set");

  const backupKeys = [...driver.store.keys()].filter((key) => key.startsWith("slev_corrupt_backup__slev_budget_limits__"));
  assertEqual(backupKeys.length, 1, "one corrupt backup key");
  assertEqual(driver.store.get(backupKeys[0]!), "{not-json", "backup keeps original blob");

  const blocked = await writeJson("slev_budget_limits", [{ category: "Food", limitAmount: 100000, period: "monthly" }]);
  assertEqual(blocked, false, "corrupt key blocks overwrite");
  assertEqual(driver.store.get("slev_budget_limits"), "{not-json", "original corrupt blob preserved");
});

test("runMigrations fresh install is a no-op and sets schema version 2", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await runMigrations();

  assertEqual(await getSchemaVersion(), 2, "schema version set");
  assertEqual(await readRaw(STORAGE_KEYS.migratedV2), "true", "v2 migration flag set");
  assertEqual(driver.store.get(STORAGE_KEYS.moments), "[]", "empty moments collection initialized");
  assertEqual((await listSpendingMoments()).length, 0, "no moments created");
});

test("runSpendingMemoryV2Migration migrates legacy moments with normalization", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await driver.setItem(
    STORAGE_KEYS.legacyMoments,
    JSON.stringify([
      {
        id: "legacy-m1",
        amount: 4999.6,
        label: "  Latte  ",
        context: "food",
        type: "purchase",
        occurredAt: "2026-05-01T00:00:00.000Z",
        createdAt: "2026-05-01T00:00:00.000Z",
        updatedAt: "2026-05-01T00:00:00.000Z"
      }
    ])
  );

  await runSpendingMemoryV2Migration();
  const moments = await listSpendingMoments();

  assertEqual(moments.length, 1, "legacy moment migrated");
  assertEqual(moments[0]?.id, "legacy-m1", "legacy id preserved");
  assertEqual(moments[0]?.amount, 5000, "amount rounded");
  assertEqual(moments[0]?.label, "Latte", "label trimmed");
  assertEqual(moments[0]?.context, "Meal", "context normalized");
  assertEqual(moments[0]?.type, "expense", "unknown type coerced to expense");
  assertEqual(driver.store.has(STORAGE_KEYS.moments), true, "moments persisted to v2 key");
});

test("runSpendingMemoryV2Migration imports only confirmed positive legacy transactions", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const timestamp = "2026-06-01T08:00:00.000Z";

  await driver.setItem(
    STORAGE_KEYS.legacyTransactions,
    JSON.stringify([
      {
        id: "tx-ok",
        amount: 45000,
        merchant: "  Coffee  ",
        category: "food",
        status: "confirmed",
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        id: "tx-pending",
        amount: 10000,
        merchant: "Pending",
        category: "Food",
        status: "pending",
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      },
      {
        id: "tx-zero",
        amount: 0,
        merchant: "Zero",
        category: "Food",
        status: "confirmed",
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ])
  );

  await runSpendingMemoryV2Migration();
  const moments = await listSpendingMoments();

  assertEqual(moments.length, 1, "only one transaction imported");
  assertEqual(moments[0]?.id, "migrated-tx-ok", "confirmed row mapped to migrated id");
  assertEqual(moments[0]?.amount, 45000, "confirmed amount preserved");
  assertEqual(moments[0]?.label, "Coffee", "merchant label normalized");
  assertEqual(moments[0]?.context, "Meal", "category normalized");
  assertEqual(moments[0]?.type, "expense", "legacy transactions become expenses");
});

test("runSpendingMemoryV2Migration is idempotent and does not duplicate migrated data", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const timestamp = "2026-06-02T08:00:00.000Z";

  await driver.setItem(
    STORAGE_KEYS.legacyMoments,
    JSON.stringify([
      {
        id: "legacy-dup",
        amount: 12000,
        label: "Snack",
        context: "Food",
        type: "expense",
        occurredAt: timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ])
  );
  await driver.setItem(
    STORAGE_KEYS.legacyTransactions,
    JSON.stringify([
      {
        id: "tx-dup",
        amount: 8000,
        merchant: "Tea",
        category: "Food",
        status: "confirmed",
        timestamp,
        createdAt: timestamp,
        updatedAt: timestamp
      }
    ])
  );

  await runMigrations();
  const first = await listSpendingMoments();
  const firstRaw = driver.store.get(STORAGE_KEYS.moments);

  await runMigrations();
  const second = await listSpendingMoments();
  const secondRaw = driver.store.get(STORAGE_KEYS.moments);

  await runSpendingMemoryV2Migration();
  const third = await listSpendingMoments();

  assertEqual(first.length, 2, "legacy moment and transaction merged");
  assertEqual(second.length, 2, "second migration keeps row count");
  assertEqual(JSON.stringify(second), JSON.stringify(first), "second migration preserves data");
  assertEqual(secondRaw, firstRaw, "stored blob unchanged on second migration");
  assertEqual(JSON.stringify(third), JSON.stringify(first), "direct v2 migration no-op after flag");
});

test("runSpendingMemoryV2Migration backs up corrupt legacy transactions without throwing", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await driver.setItem(STORAGE_KEYS.legacyTransactions, "{bad-json");

  let threw = false;
  try {
    await runSpendingMemoryV2Migration();
  } catch (error) {
    threw = error instanceof Error;
  }

  assertEqual(threw, false, "migration does not throw");
  assertEqual(isKeyCorrupt(STORAGE_KEYS.legacyTransactions), true, "corrupt flag set");
  const backupKeys = [...driver.store.keys()].filter((key) =>
    key.startsWith(corruptBackupKeyPrefix(STORAGE_KEYS.legacyTransactions))
  );
  assertEqual(backupKeys.length >= 1, true, "corrupt blob backed up");
  assertEqual(driver.store.get(backupKeys[0]!), "{bad-json", "backup keeps original blob");
  assertEqual(await readRaw(STORAGE_KEYS.migratedV2), "true", "migration marked complete");
  assertEqual((await listSpendingMoments()).length, 0, "no transactions imported from corrupt blob");
});

test("runMigrations is idempotent for legacy spending memory imports", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await driver.setItem(
    STORAGE_KEYS.legacyTransactions,
    JSON.stringify([
      {
        id: "tx-1",
        amount: 45000,
        merchant: "Coffee",
        category: "Food",
        status: "confirmed",
        timestamp: "2026-06-01T08:00:00.000Z",
        createdAt: "2026-06-01T08:00:00.000Z",
        updatedAt: "2026-06-01T08:00:00.000Z"
      }
    ])
  );

  await runMigrations();
  const first = await listSpendingMoments();
  const firstVersion = await getSchemaVersion();

  await runMigrations();
  const second = await listSpendingMoments();
  const secondVersion = await getSchemaVersion();

  assertEqual(first.length, 1, "migration imports one moment");
  assertEqual(second.length, 1, "second migration keeps one moment");
  assertEqual(first[0]?.amount, 45000, "migrated amount preserved");
  assertEqual(second[0]?.id, first[0]?.id, "migration does not duplicate rows");
  assertEqual(firstVersion, 2, "schema version set");
  assertEqual(secondVersion, 2, "schema version stays stable");
});

test("saveSpendingMoment reports write failure on corrupt storage", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await driver.setItem(STORAGE_KEYS.moments, "{bad-json");
  await readJson(STORAGE_KEYS.moments);

  const result = await saveSpendingMoment({
    amount: 10000,
    label: "Snack",
    context: "Food",
    type: "expense"
  });

  assertEqual(result.persisted, false, "corrupt storage blocks save");
  assertEqual(result.data.amount, 10000, "save still returns normalized moment");
});

test("listCorruptStorageIssues surfaces damaged collections", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await driver.setItem(STORAGE_KEYS.manualTemplates, "{bad-json");
  await readJson(STORAGE_KEYS.manualTemplates);

  const issues = listCorruptStorageIssues();
  assertEqual(issues.some((issue) => issue.key === STORAGE_KEYS.manualTemplates), true, "templates issue listed");
});

test("exportAllDataWithReport skips corrupt collections but keeps healthy exports", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await driver.setItem(STORAGE_KEYS.moments, "{bad-json");
  await readJson(STORAGE_KEYS.moments);
  await driver.setItem(
    STORAGE_KEYS.accounts,
    JSON.stringify([
      {
        id: "acct-1",
        label: "Cash",
        kind: "cash",
        isIncomeHub: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    ])
  );

  const report = await exportAllDataWithReport();
  assertEqual(report.skipped.includes(STORAGE_KEYS.moments), true, "corrupt moments skipped");
  assertEqual(Array.isArray(report.backup.data[STORAGE_KEYS.accounts]), true, "healthy accounts exported");
  assertEqual(report.backup.data[STORAGE_KEYS.moments], undefined, "corrupt moments omitted from JSON");
});

test("resetStorageKey clears only the targeted collection", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await driver.setItem(STORAGE_KEYS.moments, "{bad-json");
  await readJson(STORAGE_KEYS.moments);
  await driver.setItem(STORAGE_KEYS.accounts, "[]");

  const reset = await resetStorageKey(STORAGE_KEYS.moments);
  assertEqual(reset, true, "reset succeeds");
  assertEqual(isKeyCorrupt(STORAGE_KEYS.moments), false, "corrupt flag cleared");
  assertEqual(driver.store.has(STORAGE_KEYS.moments), false, "damaged moments key removed");
  assertEqual(driver.store.has(STORAGE_KEYS.accounts), true, "sibling key preserved");

  const written = await writeJson(STORAGE_KEYS.moments, []);
  assertEqual(written, true, "writes succeed after reset");
});

test("corrupt backup pruning keeps at most three snapshots per source key", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  const prefix = corruptBackupKeyPrefix(STORAGE_KEYS.manualTemplates);
  for (let index = 0; index < 5; index += 1) {
    await driver.setItem(`${prefix}${1_000 + index}`, "{bad-json");
  }

  await driver.setItem(STORAGE_KEYS.manualTemplates, "{bad-json");
  await readJson(STORAGE_KEYS.manualTemplates);

  const backupKeys = [...driver.store.keys()].filter((key) => key.startsWith(prefix));
  assertEqual(backupKeys.length <= 3, true, "at most three backups retained");
});

test("runMigrations throws and leaves schema version unchanged when a step fails", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  let threw = false;
  try {
    await runMigrations([
      {
        toVersion: 2,
        run: async () => {
          throw new Error("simulated migration failure");
        }
      }
    ]);
  } catch (error) {
    threw = error instanceof Error && error.message.includes("simulated migration failure");
  }

  assertEqual(threw, true, "migration failure propagates");
  assertEqual(await getSchemaVersion(), 0, "schema version not advanced after failure");
});

test("runMigrations does not mark V2 complete when moment persist fails", async () => {
  const driver = createMemoryDriver({ failWrites: new Set([STORAGE_KEYS.moments]) });
  setStorageDriver(driver);

  await driver.setItem(
    STORAGE_KEYS.legacyTransactions,
    JSON.stringify([
      {
        id: "tx-fail",
        amount: 12000,
        merchant: "Legacy",
        category: "Food",
        status: "confirmed",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    ])
  );

  let threw = false;
  try {
    await runMigrations();
  } catch (error) {
    threw = error instanceof Error && error.message.includes("Failed to persist spending moments");
  }

  assertEqual(threw, true, "persist failure aborts migration");
  assertEqual(await getSchemaVersion(), 0, "schema version not advanced");
  assertEqual(driver.store.get(STORAGE_KEYS.migratedV2), undefined, "legacy migration flag not set");
});

test("legacy stored accounts without tier normalize to tracked", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await writeJson("slev_accounts", [
    {
      id: "legacy-1",
      label: "GoPay",
      kind: "wallet",
      isIncomeHub: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
  ]);

  const accounts = await listMoneyAccounts();
  const account = accounts.find((item) => item.id === "legacy-1");
  assertEqual(account?.tier, "tracked", "missing tier defaults to tracked");
});

test("saveMoneyAccount cascades label rename across historical collections", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);
  const timestamp = "2026-06-01T00:00:00.000Z";

  await writeJson(STORAGE_KEYS.accounts, [
    {
      id: "acct-hub",
      label: "BRI",
      kind: "bank",
      isIncomeHub: true,
      tier: "tracked",
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "acct-pocket",
      label: "Pocket",
      kind: "wallet",
      isIncomeHub: false,
      tier: "tracked",
      createdAt: timestamp,
      updatedAt: timestamp
    },
    {
      id: "acct-jago",
      label: "Jago",
      kind: "bank",
      isIncomeHub: false,
      tier: "tracked",
      createdAt: timestamp,
      updatedAt: timestamp
    }
  ]);

  await saveSpendingMoment({
    amount: 25_000,
    label: "Snack",
    context: "Food",
    type: "expense",
    accountLabel: "Pocket",
    occurredAt: "2026-06-05T00:00:00.000Z"
  });
  await saveMoneyTransfer({
    amount: 50_000,
    fromAccount: "Pocket",
    toAccount: "Jago",
    occurredAt: "2026-06-06T00:00:00.000Z"
  });
  const renamed = await saveMoneyAccount({
    id: "acct-pocket",
    label: "Daily Pocket",
    kind: "wallet",
    isIncomeHub: false,
    tier: "tracked"
  });

  assertEqual(renamed.persisted, true, "rename persisted");
  const accounts = await listMoneyAccounts();
  assertEqual(
    accounts.find((account) => account.id === "acct-pocket")?.label,
    "Daily Pocket",
    "account label updated"
  );

  const moments = await listSpendingMoments();
  assertEqual(moments[0]?.accountLabel, "Daily Pocket", "moment label cascaded");

  const transfers = await listMoneyTransfers();
  assertEqual(transfers[0]?.fromAccount, "Daily Pocket", "transfer from-account cascaded");
  assertEqual(transfers[0]?.toAccount, "Jago", "transfer to-account unchanged");
});

test("account tier ephemeral persists through save and list", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await saveMoneyAccount({
    label: "QRIS Wallet",
    kind: "wallet",
    isIncomeHub: false,
    tier: "ephemeral"
  });

  const accounts = await listMoneyAccounts();
  const account = accounts.find((item) => item.label === "QRIS Wallet");
  assertEqual(account?.tier, "ephemeral", "ephemeral tier round-trips");
});

test("invalid account tier strings normalize to tracked", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await writeJson("slev_accounts", [
    {
      id: "bad-tier-1",
      label: "Mystery",
      kind: "other",
      isIncomeHub: false,
      tier: "floating",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
  ]);

  const accounts = await listMoneyAccounts();
  const account = accounts.find((item) => item.id === "bad-tier-1");
  assertEqual(account?.tier, "tracked", "invalid tier coerced to tracked");
});

test("exportAllData and importAllData round-trip finance collections", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  const saved = await saveSpendingMoment({
    amount: 25000,
    label: "Lunch",
    context: "Food",
    type: "expense"
  });
  assertEqual(saved.persisted, true, "seed moment persisted");

  const exported = await exportAllData();
  assertEqual(exported.app, "slev", "backup app id");
  assertEqual(Array.isArray(exported.data[STORAGE_KEYS.moments]), true, "moments exported");

  driver.store.clear();
  resetStorageDriver();
  setStorageDriver(driver);

  const imported = await importAllData(exported);
  assertEqual(imported.ok, true, "import succeeds");

  const moments = await listSpendingMoments();
  assertEqual(moments.length, 1, "import restores one moment");
  assertEqual(moments[0]?.amount, 25000, "imported amount preserved");
});

test("importAllData rolls back touched keys on invalid collection", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await saveSpendingMoment({
    amount: 1000,
    label: "Coffee",
    context: "Food",
    type: "expense"
  });
  const original = await exportAllData();

  const maliciousBackup = {
    ...original,
    data: {
      ...original.data,
      [STORAGE_KEYS.moments]: [
        {
          id: "new-moment",
          amount: 99999,
          label: "Hacked",
          context: "Food",
          type: "expense",
          recordedAt: "2026-06-01T00:00:00.000Z"
        }
      ],
      [STORAGE_KEYS.accounts]: "bad-value"
    }
  };

  const result = await importAllData(maliciousBackup);
  assertEqual(result.ok, false, "import fails");
  if (!result.ok) {
    assertEqual(result.code, "invalid_collection", "invalid collection code");
  }

  const moments = await listSpendingMoments();
  assertEqual(moments.length, 1, "still one moment");
  assertEqual(moments[0]?.label, "Coffee", "original moment restored");
});

test("importAllData rolls back touched keys when a write fails", async () => {
  const driver = createMemoryDriver({ failWrites: new Set([STORAGE_KEYS.accounts]) });
  setStorageDriver(driver);

  await saveSpendingMoment({
    amount: 1000,
    label: "Coffee",
    context: "Food",
    type: "expense"
  });

  const backup = {
    app: "slev" as const,
    schemaVersion: 0,
    exportedAt: new Date().toISOString(),
    data: {
      [STORAGE_KEYS.moments]: [
        {
          id: "new-moment",
          amount: 50000,
          label: "Lunch",
          context: "Food",
          type: "expense",
          recordedAt: "2026-06-01T00:00:00.000Z"
        }
      ],
      [STORAGE_KEYS.accounts]: []
    }
  };

  const result = await importAllData(backup);
  assertEqual(result.ok, false, "import fails on accounts write");
  if (!result.ok) {
    assertEqual(result.code, "restore_failed", "restore failed code");
    assertEqual(result.key, STORAGE_KEYS.accounts, "failed key");
  }

  const moments = await listSpendingMoments();
  assertEqual(moments[0]?.label, "Coffee", "original moment restored after rollback");
});

test("list actions hint defaults to unseen", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  assertEqual(await hasSeenListActionsHint("memory"), false, "hint starts unseen");
});

test("list actions hint persists after dismiss", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await markListActionsHintSeen("goals");
  assertEqual(await hasSeenListActionsHint("goals"), true, "hint marked seen");
  assertEqual(await hasSeenListActionsHint("memory"), false, "other hints stay unseen");
});

test("color scheme preference defaults to system", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  assertEqual(await getColorSchemePreference(), "system", "scheme defaults to system");
});

test("color scheme preference persists", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await setColorSchemePreference("dark");
  assertEqual(await getColorSchemePreference(), "dark", "dark scheme stored");
});

test("locale preference defaults to english", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  assertEqual(await getLocalePreference(), "en", "locale defaults to english");
});

test("locale preference persists", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await setLocalePreference("id");
  assertEqual(await getLocalePreference(), "id", "indonesian locale stored");
});

test("reduce motion preference defaults to system", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  assertEqual(await getReduceMotionPreference(), "system", "reduce motion defaults to system");
});

test("reduce motion preference persists", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await setReduceMotionPreference("on");
  assertEqual(await getReduceMotionPreference(), "on", "reduce motion on stored");
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
    console.error("storage tests failed.");
  } else {
    console.log(`${tests.length} storage tests passed.`);
  }
}

void runTests();

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