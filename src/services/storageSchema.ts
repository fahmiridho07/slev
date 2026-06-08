import { runAccountLedgerV3Migration } from "./accountLedgerMigration";
import { runSpendingMemoryV2Migration } from "./spendingMemoryRepository";
import { readRaw, writeRaw } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export { EXPORTABLE_STORAGE_KEYS, STORAGE_KEYS } from "./storageKeys";

export const SCHEMA_VERSION = 3;

export type MigrationStep = {
  toVersion: number;
  run: () => Promise<void>;
};

const DEFAULT_MIGRATIONS: MigrationStep[] = [
  {
    toVersion: 2,
    run: runSpendingMemoryV2Migration
  },
  {
    toVersion: 3,
    run: runAccountLedgerV3Migration
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