import { runAccountLedgerV3Migration } from "../src/services/accountLedgerMigration";
import { getBalanceAnchor } from "../src/services/balanceAnchorRepository";
import { listSpendingMoments } from "../src/services/spendingMemoryRepository";
import {
  readJson,
  resetStorageDriver,
  setStorageDriver,
  StorageDriver,
  writeJson
} from "../src/services/storage";
import { listMoneyAccounts } from "../src/services/accountRepository";
import { STORAGE_KEYS } from "../src/services/storageSchema";

declare const process: {
  exitCode?: number;
};

type TestCase = {
  name: string;
  run: () => void | Promise<void>;
};

const tests: TestCase[] = [];

test("runAccountLedgerV3Migration copies balance anchor into hub opening balance", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await writeJson(STORAGE_KEYS.accounts, [
    {
      id: "hub-bri",
      label: "BRI",
      kind: "bank",
      isIncomeHub: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    },
    {
      id: "acc-jago",
      label: "Jago",
      kind: "bank",
      isIncomeHub: false,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
  ]);
  await writeJson(STORAGE_KEYS.balanceAnchor, {
    amount: 2_500_000,
    setAt: "2026-06-10T12:00:00.000Z"
  });

  await runAccountLedgerV3Migration();

  const accounts = await listMoneyAccounts();
  const hub = accounts.find((account) => account.isIncomeHub);
  assertEqual(hub?.openingBalance, 2_500_000, "hub opening balance from anchor");
  assertEqual(hub?.openingSetAt, "2026-06-10T12:00:00.000Z", "hub opening setAt from anchor");

  const anchor = await getBalanceAnchor();
  assertEqual(anchor?.amount, 2_500_000, "balance anchor preserved");
});

test("runAccountLedgerV3Migration backfills missing moment account labels to hub", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await writeJson(STORAGE_KEYS.accounts, [
    {
      id: "hub-bri",
      label: "BRI",
      kind: "bank",
      isIncomeHub: true,
      openingBalance: 0,
      openingSetAt: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
  ]);
  await writeJson(STORAGE_KEYS.moments, [
    {
      id: "moment-1",
      amount: 120_000,
      occurredAt: "2026-06-05T00:00:00.000Z",
      context: "Meal",
      type: "expense",
      createdAt: "2026-06-05T00:00:00.000Z",
      updatedAt: "2026-06-05T00:00:00.000Z"
    }
  ]);

  await runAccountLedgerV3Migration();

  const moments = await listSpendingMoments();
  assertEqual(moments[0]?.accountLabel, "BRI", "missing account label backfilled to hub");
});

test("runAccountLedgerV3Migration is idempotent and does not double-apply anchor", async () => {
  const driver = createMemoryDriver();
  setStorageDriver(driver);

  await writeJson(STORAGE_KEYS.accounts, [
    {
      id: "hub-bri",
      label: "BRI",
      kind: "bank",
      isIncomeHub: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z"
    }
  ]);
  await writeJson(STORAGE_KEYS.balanceAnchor, {
    amount: 1_000_000,
    setAt: "2026-06-10T12:00:00.000Z"
  });
  await writeJson(STORAGE_KEYS.moments, [
    {
      id: "moment-1",
      amount: 50_000,
      occurredAt: "2026-06-11T00:00:00.000Z",
      context: "Meal",
      type: "expense",
      createdAt: "2026-06-11T00:00:00.000Z",
      updatedAt: "2026-06-11T00:00:00.000Z"
    }
  ]);

  await runAccountLedgerV3Migration();
  const afterFirst = await readJson(STORAGE_KEYS.accounts);
  const momentsAfterFirst = await listSpendingMoments();

  await runAccountLedgerV3Migration();
  const afterSecond = await readJson(STORAGE_KEYS.accounts);
  const momentsAfterSecond = await listSpendingMoments();

  assertEqual(JSON.stringify(afterFirst), JSON.stringify(afterSecond), "accounts unchanged on second run");
  assertEqual(JSON.stringify(momentsAfterFirst), JSON.stringify(momentsAfterSecond), "moments unchanged on second run");

  const hub = (await listMoneyAccounts()).find((account) => account.isIncomeHub);
  assertEqual(hub?.openingBalance, 1_000_000, "anchor amount applied once");
  assertEqual(
    JSON.stringify(await getBalanceAnchor()),
    JSON.stringify({ amount: 1_000_000, setAt: "2026-06-10T12:00:00.000Z" }),
    "anchor intact"
  );
});

void runTests();

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
    console.error("account ledger migration tests failed.");
  } else {
    console.log(`${tests.length} account ledger migration tests passed.`);
  }
}

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