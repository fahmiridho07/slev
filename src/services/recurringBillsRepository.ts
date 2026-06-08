import { RecurringBill } from "../features/spendingMemory.types";
import { readJson, removeKeys, WriteResult, writeJson } from "./storage";
import { STORAGE_KEYS } from "./storageSchema";

const RECURRING_BILLS_KEY = STORAGE_KEYS.recurringBills;

export type RecurringBillInput = {
  id?: string;
  label: string;
  amount: number;
  active: boolean;
  dueDay?: number | null;
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

export async function clearRecurringBills(): Promise<boolean> {
  return removeKeys([RECURRING_BILLS_KEY]);
}

export async function deleteRecurringBill(id: string): Promise<WriteResult<RecurringBill[]>> {
  const current = await listRecurringBills();
  const updated = current.filter((bill) => bill.id !== id);
  const persisted = await writeJson(RECURRING_BILLS_KEY, updated);
  return { data: updated, persisted };
}

function normalizeRecurringBill(source: unknown): RecurringBill | null {
  if (!source || typeof source !== "object") {
    return null;
  }

  const record = source as Partial<RecurringBill>;
  const label = typeof record.label === "string" ? record.label.trim() : "";
  const amount = typeof record.amount === "number" ? record.amount : Number(record.amount);
  if (!label || !Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  const dueDayRaw =
    typeof record.dueDay === "number" ? record.dueDay : Number(record.dueDay);
  const dueDay =
    Number.isFinite(dueDayRaw) && dueDayRaw >= 1 && dueDayRaw <= 31
      ? Math.round(dueDayRaw)
      : undefined;

  return {
    id: record.id ?? createId(),
    label,
    amount,
    active: record.active !== false,
    ...(dueDay !== undefined ? { dueDay } : {}),
    createdAt: record.createdAt ?? new Date().toISOString(),
    updatedAt: record.updatedAt ?? new Date().toISOString()
  };
}

function isRecurringBill(value: RecurringBill | null): value is RecurringBill {
  return value !== null;
}

function createId(): string {
  return `bill-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}