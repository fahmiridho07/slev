import { runSpendingMemoryV2Migration } from "./spendingMemoryRepository";
import { readRaw, writeRaw } from "./storage";

export const SCHEMA_VERSION = 2;

export const STORAGE_KEYS = {
  schemaVersion: "slev_schema_version",
  migratedV2: "slev_migrated_v2",
  moments: "slev_entries",
  legacyMoments: "slev.spendingMoments.v1",
  patternFeedback: "slev_pattern_feedback",
  legacyPatternFeedback: "slev.patternFeedback.v1",
  legacyTransactions: "flowtrack.transactions.v1",
  accounts: "slev_accounts",
  transfers: "slev_transfers",
  manualTemplates: "slev_manual_templates",
  recurringBills: "slev_recurring_bills",
  balanceAnchor: "slev_balance_anchor",
  expenseCategories: "slev_expense_categories"
} as const;

export const EXPORTABLE_STORAGE_KEYS = [
  STORAGE_KEYS.moments,
  STORAGE_KEYS.patternFeedback,
  STORAGE_KEYS.accounts,
  STORAGE_KEYS.transfers,
  STORAGE_KEYS.manualTemplates,
  STORAGE_KEYS.recurringBills,
  STORAGE_KEYS.balanceAnchor,
  STORAGE_KEYS.expenseCategories
] as const;

export type MigrationStep = {
  toVersion: number;
  run: () => Promise<void>;
};

const DEFAULT_MIGRATIONS: MigrationStep[] = [
  {
    toVersion: 2,
    run: runSpendingMemoryV2Migration
  }
];

export async function getSchemaVersion(): Promise<number> {
  const raw = await readRaw(STORAGE_KEYS.schemaVersion);
  if (raw !== null) {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isFinite(parsed) && parsed >= 0) {
      return parsed;
    }
  }

  const legacyMigrated = await readRaw(STORAGE_KEYS.migratedV2);
  if (legacyMigrated === "true") {
    return 2;
  }

  return 0;
}

export async function setSchemaVersion(version: number): Promise<boolean> {
  return writeRaw(STORAGE_KEYS.schemaVersion, String(version));
}

export async function runMigrations(steps: MigrationStep[] = DEFAULT_MIGRATIONS): Promise<void> {
  let version = await getSchemaVersion();

  for (const step of steps) {
    if (version >= step.toVersion) {
      continue;
    }

    await step.run();
    version = step.toVersion;
    const versionWritten = await setSchemaVersion(version);
    if (!versionWritten) {
      throw new Error(`Failed to persist schema version ${version}`);
    }
  }

  if (version < SCHEMA_VERSION) {
    const versionWritten = await setSchemaVersion(SCHEMA_VERSION);
    if (!versionWritten) {
      throw new Error(`Failed to persist schema version ${SCHEMA_VERSION}`);
    }
  }
}