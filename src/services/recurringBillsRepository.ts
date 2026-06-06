import { RecurringBill, SpendingContext } from "../features/spendingMemory.types";
import { normalizeSpendingContext } from "../data/spendingMemory";
import { readJson, WriteResult, writeJson } from "./storage";
import { STORAGE_KEYS } from "./storageSchema";

const RECURRING_BILLS_KEY = STORAGE_KEYS.recurringBills;

export type RecurringBillInput = {
  id?: string;
  label: string;
  amount: number;
  context: SpendingContext;
  accountLabel?: string;
  dayOfMonth: number;
  active: boolean;
  lastPaidMonth?: string;
};

export async function listRecurringBills(): Promise<RecurringBill[]> {
  const result = await readJson<unknown>(RECURRING_BILLS_KEY);
  if (result.status !== "ok" || !Array.isArray(result.value)) return [];
  return result.value.map(normalizeRecurringBill).filter(isRecurringBill);
}

export async function saveRecurringBill(input: RecurringBillInput): Promise<WriteResult<RecurringBill[]>> {
  const current = await listRecurringBills();
  const now = new Date().toISOString();
  const existing = input.id ? current.find((bill) => bill.id === input.id) : undefined;
  const bill = normalizeRecurringBill({
    ...input,
    id: input.id ?? createId(),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now
  });
  if (!bill) return { data: current, persisted: true };

  const updated = [
    bill,
    ...current.filter((item) => item.id !== bill.id)
  ].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const persisted = await writeJson(RECURRING_BILLS_KEY, updated);
  return { data: updated, persisted };
}

export async function deleteRecurringBill(id: string): Promise<WriteResult<RecurringBill[]>> {
  const current = await listRecurringBills();
  const updated = current.filter((bill) => bill.id !== id);
  const persisted = await writeJson(RECURRING_BILLS_KEY, updated);
  return { data: updated, persisted };
}

function normalizeRecurringBill(source: Partial<RecurringBill>): RecurringBill | null {
  const label = typeof source.label === "string" ? source.label.trim() : "";
  const amount = typeof source.amount === "number" ? source.amount : Number(source.amount);
  if (!label || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const dayOfMonth = clampDayOfMonth(
    typeof source.dayOfMonth === "number" ? source.dayOfMonth : Number(source.dayOfMonth)
  );

  return {
    id: source.id ?? createId(),
    label,
    amount,
    context: normalizeSpendingContext(source.context),
    accountLabel: typeof source.accountLabel === "string" && source.accountLabel.trim()
      ? source.accountLabel.trim()
      : undefined,
    dayOfMonth,
    active: source.active !== false,
    lastPaidMonth: typeof source.lastPaidMonth === "string" ? source.lastPaidMonth : undefined,
    createdAt: source.createdAt ?? new Date().toISOString(),
    updatedAt: source.updatedAt ?? new Date().toISOString()
  };
}

function isRecurringBill(value: RecurringBill | null): value is RecurringBill {
  return value !== null;
}

function clampDayOfMonth(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(31, Math.max(1, Math.round(value)));
}

function createId(): string {
  return `bill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}