import { listSpendingMoments, saveSpendingMoment } from "../src/services/spendingMemoryRepository";
import { exportAllData, importAllData } from "../src/services/storageBackup";
import {
  isKeyCorrupt,
  readJson,
  resetStorageDriver,
  setStorageDriver,
  StorageDriver,
  writeJson,
  writeRaw
} from "../src/services/storage";
import { getSchemaVersion, runMigrations, STORAGE_KEYS } from "../src/services/storageSchema";

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

test("exportAllData and importAllData round-trip finance collections", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await saveSpendingMoment({
    amount: 25000,
    label: "Lunch",
    context: "Food",
    type: "expense"
  });

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
    }
  };
}