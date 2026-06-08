import { AccountTier, MoneyAccount, MoneyTransfer } from "../features/spendingMemory.types";
import { rewriteAccountLabelInManualTemplates } from "./manualFinanceRepository";

import { rewriteAccountLabelInMoments } from "./spendingMemoryRepository";
import {
  cleanOptionalText,
  createId,
  readNumber,
  readString,
  toRecord
} from "./storageRecordUtils";
import { isKeyCorrupt, readJson, removeKeys, WriteResult, writeJson } from "./storage";

const ACCOUNTS_KEY = "slev_accounts";
const TRANSFERS_KEY = "slev_transfers";

type AccountInput = {
  id?: string;
  isIncomeHub?: boolean;
  kind: MoneyAccount["kind"];
  label: string;
  tier?: AccountTier;
};

type TransferInput = {
  amount: number;
  fromAccount: string;
  note?: string;
  occurredAt?: string;
  toAccount: string;
};

const DEFAULT_ACCOUNTS: MoneyAccount[] = [
  createDefaultAccount("default-bri", "BRI", "bank", true),
  createDefaultAccount("default-jago", "Jago", "bank", false),
  createDefaultAccount("default-wallet", "E-Wallet", "wallet", false),
  createDefaultAccount("default-cash", "Cash", "cash", false)
];

export async function listMoneyAccounts(): Promise<MoneyAccount[]> {
  const result = await readJson<unknown>(ACCOUNTS_KEY);
  if (result.status !== "ok") return DEFAULT_ACCOUNTS;

  if (!Array.isArray(result.value)) return DEFAULT_ACCOUNTS;
  const accounts = result.value.map(normalizeMoneyAccount).filter(isMoneyAccount);
  return accounts.length > 0 ? sortAccounts(normalizeIncomeHubs(accounts)) : DEFAULT_ACCOUNTS;
}

export async function saveMoneyAccount(input: AccountInput): Promise<WriteResult<MoneyAccount[]>> {
  const current = await listMoneyAccounts();
  const existing = input.id ? current.find((account) => account.id === input.id) : undefined;
  const now = new Date().toISOString();
  const account = normalizeMoneyAccount({
    ...input,
    id: input.id ?? createId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  });
  if (!account) return { data: current, persisted: true };

  const merged = [
    account,
    ...current.filter((item) => item.id !== account.id && item.label.toLowerCase() !== account.label.toLowerCase())
  ];
  const updated = sortAccounts(normalizeIncomeHubs(merged, account.isIncomeHub ? account.id : undefined));

  if (existing && existing.label !== account.label) {
    const cascaded = await cascadeAccountLabelRename(existing.label, account.label);
    if (!cascaded) {
      return { data: current, persisted: false };
    }
  }

  const persisted = await writeJson(ACCOUNTS_KEY, updated);
  if (!persisted && existing && existing.label !== account.label) {
    await cascadeAccountLabelRename(account.label, existing.label);
  }
  return { data: updated, persisted };
}

export async function deleteMoneyAccount(id: string): Promise<WriteResult<MoneyAccount[]>> {
  const current = await listMoneyAccounts();
  const remaining = current.filter((account) => account.id !== id);
  const updated = remaining.length > 0 ? sortAccounts(normalizeIncomeHubs(remaining)) : current;
  const persisted = await writeJson(ACCOUNTS_KEY, updated);
  return { data: updated, persisted };
}

export async function listMoneyTransfers(): Promise<MoneyTransfer[]> {
  const result = await readJson<unknown>(TRANSFERS_KEY);
  if (result.status !== "ok" || !Array.isArray(result.value)) return [];
  return result.value.map(normalizeMoneyTransfer).filter(isMoneyTransfer).sort(sortTransfers);
}

export async function saveMoneyTransfer(input: TransferInput): Promise<WriteResult<MoneyTransfer[]>> {
  const current = await listMoneyTransfers();
  const now = new Date().toISOString();
  const transfer = normalizeMoneyTransfer({
    ...input,
    id: createId(),
    occurredAt: input.occurredAt ?? now,
    createdAt: now,
    updatedAt: now
  });
  if (!transfer) return { data: current, persisted: true };

  const updated = [transfer, ...current].slice(0, 200).sort(sortTransfers);
  const persisted = await writeJson(TRANSFERS_KEY, updated);
  return { data: updated, persisted };
}

export async function deleteMoneyTransfer(id: string): Promise<WriteResult<MoneyTransfer[]>> {
  const current = await listMoneyTransfers();
  const updated = current.filter((transfer) => transfer.id !== id);
  const persisted = await writeJson(TRANSFERS_KEY, updated);
  return { data: updated, persisted };
}

export async function clearAccountsAndTransfers(): Promise<boolean> {
  return removeKeys([ACCOUNTS_KEY, TRANSFERS_KEY]);
}

export function isAccountsStorageCorrupt(): boolean {
  return isKeyCorrupt(ACCOUNTS_KEY);
}

export function isTransfersStorageCorrupt(): boolean {
  return isKeyCorrupt(TRANSFERS_KEY);
}

function normalizeMoneyAccount(value: unknown): MoneyAccount | null {
  const record = toRecord(value);
  if (!record) return null;
  const label = cleanLabel(readString(record, "label"));
  if (!label) return null;
  const now = new Date().toISOString();

  return {
    id: readString(record, "id") ?? createId(),
    label,
    kind: normalizeAccountKind(readString(record, "kind")),
    isIncomeHub: readBoolean(record, "isIncomeHub") ?? false,
    tier: normalizeAccountTier(readString(record, "tier")),
    createdAt: readString(record, "createdAt") ?? now,
    updatedAt: readString(record, "updatedAt") ?? now
  };
}

function normalizeMoneyTransfer(value: unknown): MoneyTransfer | null {
  const record = toRecord(value);
  if (!record) return null;
  const amount = normalizeAmount(readNumber(record, "amount") ?? 0);
  const fromAccount = cleanLabel(readString(record, "fromAccount"));
  const toAccount = cleanLabel(readString(record, "toAccount"));
  if (amount <= 0 || !fromAccount || !toAccount || fromAccount === toAccount) return null;
  const now = new Date().toISOString();

  return {
    id: readString(record, "id") ?? createId(),
    amount,
    fromAccount,
    toAccount,
    occurredAt: readString(record, "occurredAt") ?? now,
    note: cleanOptionalText(readString(record, "note")),
    createdAt: readString(record, "createdAt") ?? now,
    updatedAt: readString(record, "updatedAt") ?? now
  };
}

function createDefaultAccount(
  id: string,
  label: string,
  kind: MoneyAccount["kind"],
  isIncomeHub: boolean,
  tier: AccountTier = "tracked"
): MoneyAccount {
  const createdAt = "2026-01-01T00:00:00.000Z";
  return {
    id,
    label,
    kind,
    isIncomeHub,
    tier,
    createdAt,
    updatedAt: createdAt
  };
}

function sortAccounts(accounts: MoneyAccount[]): MoneyAccount[] {
  return [...accounts].sort((a, b) => {
    if (a.isIncomeHub !== b.isIncomeHub) return a.isIncomeHub ? -1 : 1;
    return a.label.localeCompare(b.label);
  });
}

function normalizeIncomeHubs(accounts: MoneyAccount[], preferredHubId?: string): MoneyAccount[] {
  if (accounts.length === 0) return accounts;
  const sorted = sortAccounts(accounts);
  const selectedHub =
    sorted.find((account) => account.id === preferredHubId && account.isIncomeHub) ??
    sorted.find((account) => account.isIncomeHub) ??
    sorted[0];

  return sorted.map((account) => ({
    ...account,
    isIncomeHub: account.id === selectedHub.id
  }));
}

function sortTransfers(a: MoneyTransfer, b: MoneyTransfer): number {
  return Date.parse(b.occurredAt) - Date.parse(a.occurredAt);
}

function normalizeAccountKind(value: string | undefined): MoneyAccount["kind"] {
  if (value === "bank" || value === "wallet" || value === "cash") return value;
  return "other";
}

function normalizeAccountTier(value: string | undefined): AccountTier {
  return value === "ephemeral" ? "ephemeral" : "tracked";
}

function readBoolean(record: Record<string, unknown>, key: string): boolean | undefined {
  const value = record[key];
  return typeof value === "boolean" ? value : undefined;
}

function isMoneyAccount(value: MoneyAccount | null): value is MoneyAccount {
  return value !== null;
}

function isMoneyTransfer(value: MoneyTransfer | null): value is MoneyTransfer {
  return value !== null;
}

function normalizeAmount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.round(value)) : 0;
}

function cleanLabel(value: string | undefined): string | undefined {
  const cleaned = String(value ?? "").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 32) : undefined;
}

async function rewriteAccountLabelInTransfers(oldLabel: string, newLabel: string): Promise<boolean> {
  if (oldLabel === newLabel) return true;

  const current = await listMoneyTransfers();
  let changed = false;
  const updated = current.map((transfer) => {
    const fromAccount = transfer.fromAccount === oldLabel ? newLabel : transfer.fromAccount;
    const toAccount = transfer.toAccount === oldLabel ? newLabel : transfer.toAccount;
    if (fromAccount === transfer.fromAccount && toAccount === transfer.toAccount) {
      return transfer;
    }
    changed = true;
    return {
      ...transfer,
      fromAccount,
      toAccount,
      updatedAt: new Date().toISOString()
    };
  });
  if (!changed) return true;

  return writeJson(TRANSFERS_KEY, updated.sort(sortTransfers));
}

async function cascadeAccountLabelRename(oldLabel: string, newLabel: string): Promise<boolean> {
  const steps: Array<{
    apply: () => Promise<boolean>;
    rollback: () => Promise<boolean>;
  }> = [
    {
      apply: () => rewriteAccountLabelInMoments(oldLabel, newLabel),
      rollback: () => rewriteAccountLabelInMoments(newLabel, oldLabel)
    },
    {
      apply: () => rewriteAccountLabelInTransfers(oldLabel, newLabel),
      rollback: () => rewriteAccountLabelInTransfers(newLabel, oldLabel)
    },
    {
      apply: () => rewriteAccountLabelInManualTemplates(oldLabel, newLabel),
      rollback: () => rewriteAccountLabelInManualTemplates(newLabel, oldLabel)
    }
  ];

  const completed: Array<() => Promise<boolean>> = [];
  for (const step of steps) {
    const ok = await step.apply();
    if (!ok) {
      for (const rollback of completed.reverse()) {
        await rollback();
      }
      return false;
    }
    completed.push(step.rollback);
  }

  return true;
}