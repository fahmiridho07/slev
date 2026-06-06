import { listMoneyAccounts, listMoneyTransfers } from "./accountRepository";
import { listBudgetLimits } from "./budgetRepository";
import { listExpenseCategories } from "./categoryRepository";
import {
  listBalanceSnapshots,
  listCategoryModes,
  listManualTemplates,
  listSavingsGoals
} from "./manualFinanceRepository";
import { listPatternFeedback, listSpendingMoments } from "./spendingMemoryRepository";
import { clearCorruptFlag, readJson, writeJson } from "./storage";
import {
  EXPORTABLE_STORAGE_KEYS,
  getSchemaVersion,
  runMigrations,
  SCHEMA_VERSION,
  STORAGE_KEYS
} from "./storageSchema";

export const BACKUP_APP_ID = "slev";

export type StorageBackup = {
  app: typeof BACKUP_APP_ID;
  schemaVersion: number;
  exportedAt: string;
  data: Partial<Record<(typeof EXPORTABLE_STORAGE_KEYS)[number], unknown>>;
};

export type ImportResult =
  | { ok: true }
  | { ok: false; reason: string };

export async function exportAllData(): Promise<StorageBackup> {
  const data: StorageBackup["data"] = {};

  for (const key of EXPORTABLE_STORAGE_KEYS) {
    const result = await readJson(key);
    if (result.status === "ok") {
      data[key] = result.value;
    }
  }

  return {
    app: BACKUP_APP_ID,
    schemaVersion: await getSchemaVersion(),
    exportedAt: new Date().toISOString(),
    data
  };
}

export async function importAllData(raw: unknown): Promise<ImportResult> {
  const backup = parseBackup(raw);
  if (!backup) {
    return { ok: false, reason: "That backup file is not valid Slev data." };
  }

  let importedAny = false;
  for (const key of EXPORTABLE_STORAGE_KEYS) {
    const value = backup.data[key];
    if (value === undefined) {
      continue;
    }

    if (!isImportableValue(value)) {
      return { ok: false, reason: `Backup data for ${key} is not a valid JSON collection.` };
    }

    clearCorruptFlag(key);
    const written = await writeJson(key, value);
    if (!written) {
      return { ok: false, reason: `Could not restore ${key}. Try freeing device storage.` };
    }
    importedAny = true;
  }

  if (!importedAny) {
    return { ok: false, reason: "That backup has no recognizable finance data." };
  }

  const normalized = await normalizeImportedData();
  if (!normalized) {
    return { ok: false, reason: "Imported data could not be normalized. Your previous data is unchanged." };
  }

  if (backup.schemaVersion < SCHEMA_VERSION) {
    await runMigrations();
  } else {
    await writeJson(STORAGE_KEYS.schemaVersion, String(SCHEMA_VERSION));
  }

  return { ok: true };
}

function parseBackup(raw: unknown): StorageBackup | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Partial<StorageBackup>;
  if (source.app !== BACKUP_APP_ID) return null;
  if (!source.data || typeof source.data !== "object" || Array.isArray(source.data)) return null;

  const schemaVersion =
    typeof source.schemaVersion === "number" && Number.isFinite(source.schemaVersion)
      ? Math.max(0, Math.floor(source.schemaVersion))
      : 0;
  const exportedAt = typeof source.exportedAt === "string" ? source.exportedAt : new Date().toISOString();

  return {
    app: BACKUP_APP_ID,
    schemaVersion,
    exportedAt,
    data: source.data
  };
}

function isImportableValue(value: unknown): boolean {
  return Array.isArray(value) || (value !== null && typeof value === "object");
}

async function normalizeImportedData(): Promise<boolean> {
  const writes = await Promise.all([
    writeJson(STORAGE_KEYS.moments, await listSpendingMoments()),
    writeJson(STORAGE_KEYS.patternFeedback, await listPatternFeedback()),
    writeJson(STORAGE_KEYS.accounts, await listMoneyAccounts()),
    writeJson(STORAGE_KEYS.transfers, await listMoneyTransfers()),
    writeJson(STORAGE_KEYS.budgetLimits, await listBudgetLimits()),
    writeJson(STORAGE_KEYS.monthlyPlans, await readMonthlyPlansForExport()),
    writeJson(STORAGE_KEYS.manualTemplates, await listManualTemplates()),
    writeJson(STORAGE_KEYS.categoryModes, await listCategoryModes()),
    writeJson(STORAGE_KEYS.savingsGoals, await listSavingsGoals()),
    writeJson(STORAGE_KEYS.balanceSnapshots, await listBalanceSnapshots()),
    writeJson(STORAGE_KEYS.expenseCategories, await readExpenseCategoriesForExport())
  ]);

  return writes.every(Boolean);
}

async function readMonthlyPlansForExport(): Promise<unknown> {
  const result = await readJson(STORAGE_KEYS.monthlyPlans);
  return result.status === "ok" ? result.value : [];
}

async function readExpenseCategoriesForExport(): Promise<unknown> {
  const result = await readJson(STORAGE_KEYS.expenseCategories);
  if (result.status === "ok") {
    return result.value;
  }

  return (await listExpenseCategories()).map((category) => ({
    ...category,
    isArchived: false
  }));
}